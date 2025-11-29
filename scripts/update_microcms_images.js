const fs = require('fs');
const path = require('path');
const { createClient } = require('microcms-js-sdk');
const FormData = require('form-data');
const fetch = require('node-fetch'); // Ensure node-fetch is available or use global fetch if Node 18+

require('dotenv').config({ path: '.env.local' });

const client = createClient({
    serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
    apiKey: process.env.MICROCMS_API_KEY,
});

const IMAGE_DIR = 'public/images/products';

const PRODUCT_MAPPING = {
    '【新物】鳥取砂丘“とろける”ながいも 1kg': 'nagaimo_1kg_new.png',
    '【訳あり】鳥取砂丘“とろける”ながいも 1kg': 'nagaimo_1kg_b_grade.jpeg',
    '【訳あり】傷あり 採れたて！砂地で育った甘～い”紅はるか”1.5kg': 'beniharuka_1_5kg_b_grade.png',
    '【百花蜜】はちみつ 600g 1瓶': 'honey_hyakka_600g.jpeg',
    '【鳥取県産】はちみつ 600g 2瓶': 'honey_hyakka_600g_2bottles.png',
    '【新物】鳥取県産 ねばりっこ 1kg程度': 'nebarikko_1kg.png',
    '【アカシア】はちみつ 600g 1瓶': 'honey_acacia_600g.jpeg',
    '【秀品】白ネギ 3kg': 'negi_3kg.jpeg',
    '【トチ】はちみつ 600g 1瓶': 'honey_tochi_600g.jpeg',
    '【鳥取県産】砂丘育ち 甘酢らっきょう 180': 'rakkyo_180g.png',
    '【ご自宅用】鳥取県産むかご 500g': 'mukago_500g.png',
    '【鳥取県産】黄金里芋 1kg': 'satoimo_1kg.png',
    '【自然派】採れたてそのまま！ちびっこ紅はるか': 'beniharuka_small_1kg.jpeg',
    '【鳥取県産】砂丘育ち 甘酢らっきょう 500': 'rakkyo_500g.png',
    '【新物】鳥取砂丘“ねっとり甘い”紅はるか 1.5kg': 'beniharuka_1_5kg_new.png',
    '【規格外品】白ネギ 10kg程度': 'negi_10kg_b_grade.jpeg',
    '【Sサイズ】鳥取県産むかご 5kg': 'mukago_5kg.jpeg',
    '【Sサイズ】鳥取県産むかご 10kg': 'mukago_10kg.jpeg',
    '【鳥取県産】とっくり芋 2kg前後': 'tokkuri_imo_2kg.png',
};

async function uploadImage(filePath) {
    const fileStream = fs.createReadStream(filePath);
    const formData = new FormData();
    formData.append('file', fileStream);

    const response = await fetch(`https://${process.env.MICROCMS_SERVICE_DOMAIN}.microcms.io/api/v1/media`, {
        method: 'POST',
        headers: {
            'X-MICROCMS-API-KEY': process.env.MICROCMS_API_KEY,
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Failed to upload image: ${response.statusText}`);
    }

    const data = await response.json();
    return data.url;
}

async function main() {
    console.log('Fetching products...');
    const products = await client.getList({ endpoint: 'products', queries: { limit: 100 } });
    console.log(`Found ${products.totalCount} products.`);

    for (const product of products.contents) {
        let matchedFile = null;
        for (const [key, filename] of Object.entries(PRODUCT_MAPPING)) {
            if (product.name.includes(key)) {
                matchedFile = filename;
                break;
            }
        }

        if (matchedFile) {
            const filePath = path.join(IMAGE_DIR, matchedFile);
            if (fs.existsSync(filePath)) {
                console.log(`Uploading image for ${product.name}: ${matchedFile}`);
                try {
                    const imageUrl = await uploadImage(filePath);
                    console.log(`Uploaded. Updating product ${product.id}...`);

                    await client.update({
                        endpoint: 'products',
                        contentId: product.id,
                        content: {
                            image: { url: imageUrl, height: 800, width: 800 }, // Mock dimensions or fetch real ones if needed
                        },
                    });
                    console.log(`Product updated!`);
                } catch (error) {
                    console.error(`Error processing ${product.name}:`, error);
                }
            } else {
                console.warn(`File not found: ${filePath}`);
            }
        } else {
            console.log(`No matching image found for: ${product.name}`);
        }
    }
}

main();
