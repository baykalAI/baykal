const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureBtn = document.getElementById('capture-btn');
const resultElement = document.getElementById('result');
const context = canvas.getContext('2d');

async function initializeCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (err) {
        console.error('Kamera erişilemez:', err);
    }
}

async function captureImage() {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const image = canvas.toDataURL('image/png');
    return image;
}

async function recognizeText(image) {
    const result = await Tesseract.recognize(image, 'eng', { logger: console.log });
    return result.data.text;
}

async function solveProblem(text) {
    const apiKey = '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';

    const endpoint = 'https://api.openai.com/v1/engines/davinci/completions';

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
    };
    

    const data = {
        'prompt': `Çözümü verin: ${text}`,
        'max_tokens': 50,
    };

    const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
    });

    const result = await response.json();
    const choices = result.choices;
    if (choices && choices.length > 0) {
        return choices[0].text;
    } else {
        throw new Error('API yanıtında seçenekler bulunamadı.');
    }
}

captureBtn.addEventListener('click', async () => {
    const image = await captureImage();
    const text = await recognizeText(image);
    try {
        const solution = await solveProblem(text);
        resultElement.textContent = solution;
    } catch (err) {
        console.error(err);
        resultElement.textContent = 'Hata: ' + err.message;
    }
});

initializeCamera();
