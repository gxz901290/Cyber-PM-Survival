const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async function (event) {
  // 只允许 POST 请求
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // 从环境变量读取秘密钥匙
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // 获取前端传来的参数（面试阶段和考察维度）
    const { stage, dim } = JSON.parse(event.body);

    const prompt = `你是一位赛博朋克风格的大厂产品面试官。
    请针对【${stage}】阶段，考察候选人的【${dim}】能力，出一道面试题。
    要求：
    1. 题目要有具体的职场背景（如：上线前夕发现Bug、研发不配合等）。
    2. 提供三个选项：A、B、C，其中一个是最佳答案。
    3. 严格返回以下 JSON 格式，不要有任何其他解释文字：
    {
      "question": "题目内容",
      "options": ["选项A", "选项B", "选项C"],
      "hint": "提示词",
      "answer": "参考答案要点"
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 简单清洗一下 AI 返回的文本（去掉可能存在的 markdown 标记）
    const cleanedJson = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: cleanedJson,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};