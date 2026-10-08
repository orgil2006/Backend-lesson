export function logger(req, res, next) {
  const start = Date.now();
  const path = req.originalUrl; // router дотор req.url богиношоодхын тулд эхлээд хадгална

  res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${path} ${res.statusCode} ${ms}ms`);
  });

  next();
}
