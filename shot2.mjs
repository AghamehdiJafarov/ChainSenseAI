import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  args: [...chromium.args, "--no-sandbox"], executablePath: await chromium.executablePath(), headless: "shell",
});
const page = await browser.newPage();
// full landing desktop
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto("http://localhost:4173/", { waitUntil: "networkidle0" });
await page.evaluate(async () => { for (let y=0;y<=document.body.scrollHeight;y+=700){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,90));} window.scrollTo(0,0); });
await new Promise(r => setTimeout(r, 900));
await page.screenshot({ path: "/tmp/land-full.png", fullPage: true });
// mobile landing
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
await page.goto("http://localhost:4173/", { waitUntil: "networkidle0" });
await new Promise(r => setTimeout(r, 900));
await page.screenshot({ path: "/tmp/land-mob.png" });
// mobile app with drawer
await page.goto("http://localhost:4173/app", { waitUntil: "networkidle0" });
await new Promise(r => setTimeout(r, 700));
await page.screenshot({ path: "/tmp/app-mob.png" });
await page.evaluate(() => document.querySelector("header button")?.click());
await new Promise(r => setTimeout(r, 600));
await page.screenshot({ path: "/tmp/app-mob-drawer.png" });
await browser.close(); console.log("done");
