import puppeteer from 'puppeteer';

async function autoRecord() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    console.log('Opening recording page...');
    await page.goto('https://test-vid-api.surge.sh/?video=https://test-vid-api.surge.sh/video.mp4&audio=https://test-vid-api.surge.sh/video.mp4', {
        waitUntil: 'networkidle2',
    });

    console.log('Waiting for recording to finish...');
    await new Promise(resolve => setTimeout(resolve, 120000)); // 2 minutes wait

    console.log('Recording done. Closing browser.');
    await browser.close();
}

autoRecord();
