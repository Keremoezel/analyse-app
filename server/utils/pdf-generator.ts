import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium-min'
import { existsSync } from 'node:fs'

// Extend window object to include print function if needed
declare global {
    interface Window {
        print: () => void
    }
}

export async function generatePdf(html: string): Promise<Buffer> {
    let browser

    try {
        const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'

        // Browser options
        const options = isProduction
            ? {
                args: [
                    ...chromium.args,
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--single-process',
                    '--disable-gpu',
                ],
                defaultViewport: (chromium as any).defaultViewport,
                executablePath: await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v143.0.4/chromium-v143.0.4-pack.x64.tar'),
                headless: (chromium as any).headless,
                ignoreHTTPSErrors: true,
            }
            : {
                args: [],
                executablePath: '',
                headless: true
            }

        // If local and puppeteer (full) is available, use it as fallback for executable path finding
        if (!isProduction) {
            try {
                // Dynamic import to avoid bundling issues
                const puppeteerFull = await import('puppeteer')
                // Try named export or default export
                // @ts-ignore
                const resolver = puppeteerFull.executablePath || (puppeteerFull.default && puppeteerFull.default.executablePath)

                if (resolver) {
                    const resolvedPath = resolver()
                    if (existsSync(resolvedPath)) {
                        options.executablePath = resolvedPath
                        console.log('Using Puppeteer downloaded Chrome:', options.executablePath)
                    } else {
                        console.warn('Puppeteer downloaded Chrome not found at:', resolvedPath)
                    }
                }
            } catch (e) {
                console.warn('Full puppeteer package not found or error loading it:', e)
            }

            // Fallback to common Windows paths if no valid path yet
            if (!options.executablePath || !existsSync(options.executablePath)) {
                const commonPaths = [
                    process.env.CHROME_EXECUTABLE_PATH,
                    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
                    `C:\\Users\\${process.env.USERNAME}\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe`
                ].filter(Boolean) as string[]

                for (const path of commonPaths) {
                    if (existsSync(path)) {
                        options.executablePath = path
                        console.log('Found system Chrome at:', path)
                        break
                    }
                }
            }

            if (!options.executablePath) {
                throw new Error('Could not find Chrome executable. Please install Chrome or set CHROME_EXECUTABLE_PATH env var.')
            }
        }

        console.log('Launching browser with options:', options.executablePath)
        browser = await puppeteer.launch(options)
        const page = await browser.newPage()

        // Set content
        await page.setContent(html, {
            waitUntil: 'networkidle0',
        })

        // Generate PDF
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0px',
                right: '0px',
                bottom: '0px',
                left: '0px',
            },
        })

        return Buffer.from(pdf)

    } catch (error: any) {
        console.error('Error generating PDF:', error)
        throw new Error(`Failed to generate PDF: ${error.message}`)
    } finally {
        if (browser) {
            await browser.close()
        }
    }
}
