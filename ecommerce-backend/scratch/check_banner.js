import https from 'https';

const url = 'https://res.cloudinary.com/dft1i2ozo/image/upload/v1783507025/tivaa-products/zg4qw2lumbq8elwxujso.jpg';

https.get(url, (res) => {
    console.log('Status Code:', res.statusCode);
    console.log('Headers:', res.headers);
    res.resume();
}).on('error', (e) => {
    console.error(e);
});
