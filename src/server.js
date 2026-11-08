import http from "node:http";
import { 
  draftVisitFromNotes, 
  generateDailySummary, 
  generateMonthlySummary, 
  generateInventoryInsights, 
  draftFollowUpReminder 
} from "./ai/index.js";

const PORT = process.env.PORT || 5000;

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // Health check
  if (req.method === "GET" && url.pathname === "/api/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "healthy", service: "ClinicFlow AI - Member 3 AI Engine" }));
    return;
  }

  // 1. Visit Draft Endpoint (Member 1's 7-field AI Draft)
  if (req.method === "POST" && url.pathname === "/api/ai/draft-visit") {
    try {
      const body = await parseBody(req);
      const inputContent = body.notes || body.transcript || body.inputContent || "";
      const result = await draftVisitFromNotes({ inputContent, referenceDate: body.referenceDate });
      
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // 2. Daily Summary Endpoint
  if (req.method === "POST" && url.pathname === "/api/ai/daily-summary") {
    try {
      const body = await parseBody(req);
      const result = await generateDailySummary(body);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // 3. Monthly Summary Endpoint
  if (req.method === "POST" && url.pathname === "/api/ai/monthly-summary") {
    try {
      const body = await parseBody(req);
      const result = await generateMonthlySummary(body);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // 4. Inventory Insights Endpoint
  if (req.method === "POST" && url.pathname === "/api/ai/inventory-insights") {
    try {
      const body = await parseBody(req);
      const itemsList = body.items || body.inventory || [];
      const result = await generateInventoryInsights(itemsList);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // 5. Follow-Up Reminder Drafter
  if (req.method === "POST" && url.pathname === "/api/ai/draft-reminder") {
    try {
      const body = await parseBody(req);
      const result = await draftFollowUpReminder(body);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // 404
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Endpoint not found" }));
});

server.listen(PORT, () => {
  console.log(`[ClinicFlow AI] Member 3 AI Server running on http://localhost:${PORT}`);
  console.log(`Ready to serve Member 1 (Frontend) and Member 2 (Backend).`);
});

