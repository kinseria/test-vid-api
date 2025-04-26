import puppeteer from 'puppeteer';

async function autoRecord() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    console.log('Opening recording page...');
    await page.goto('https://test-vid-api.surge.sh/?video=https://test-vid-api.surge.sh/video.mp4&audio=https://test-vid-api.surge.sh/video.mp4', {
        waitUntil: 'networkidle2',
    });

    console.log('Waiting for recording to finish...');
    await page.waitForTimeout(120000); // Wait 2 minutes (adjust depending on your recording time)

    console.log('Recording done. Closing browser.');
    await browser.close();
}

autoRecord();
