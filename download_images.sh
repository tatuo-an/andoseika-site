#!/bin/bash
mkdir -p public/images/products

# 1. Nagaimo New 1kg
curl -s "https://storage.googleapis.com/farmers-production-b8884/uploads/farmers_product_image/path/50047/thumb_easy-banana-2025-11-26T17-29-04-279Z.png" -o public/images/products/nagaimo_1kg_new.png

# 2. Nagaimo B-grade 1kg
curl -s "https://storage.googleapis.com/farmers-production-b8884/uploads/farmers_product_image/path/36301/thumb_50901_0.jpeg" -o public/images/products/nagaimo_1kg_b_grade.jpeg

# 3. Beniharuka B-grade 1.5kg
curl -s "https://storage.googleapis.com/farmers-production-b8884/uploads/farmers_product_image/path/47984/thumb_ChatGPT_Image_2025%E5%B9%B411%E6%9C%888%E6%97%A5_07_51_44.png" -o public/images/products/beniharuka_1_5kg_b_grade.png

# 4. Honey Hyakka 600g
curl -s "https://storage.googleapis.com/farmers-production-b8884/uploads/farmers_product_image/path/28723/thumb_S__134070290.jpeg" -o public/images/products/honey_hyakka_600g.jpeg

# 5. Honey Hyakka 600g 2 bottles
curl -s "https://storage.googleapis.com/farmers-production-b8884/uploads/farmers_product_image/path/18106/thumb_image_picker_0BE1F85D-2B9B-44D9-9310-2741C638FCEA-52648-00000EB5EBFFDD85_2000x2000.png" -o public/images/products/honey_hyakka_600g_2bottles.png

# 6. Nebarikko 1kg
curl -s "https://storage.googleapis.com/farmers-production-b8884/uploads/farmers_product_image/path/50054/thumb_easy-banana-2025-11-26T22-59-13-216Z.png" -o public/images/products/nebarikko_1kg.png

# 7. Honey Acacia 600g
curl -s "https://storage.googleapis.com/farmers-production-b8884/uploads/farmers_product_image/path/27412/thumb_3848343_0.jpeg" -o public/images/products/honey_acacia_600g.jpeg

# 8. Negi 3kg
curl -s "https://storage.googleapis.com/farmers-production-b8884/uploads/farmers_product_image/path/27820/thumb_65891.jpeg" -o public/images/products/negi_3kg.jpeg

# 9. Honey Tochi 600g
curl -s "https://storage.googleapis.com/farmers-production-b8884/uploads/farmers_product_image/path/27424/thumb_3848345_0.jpeg" -o public/images/products/honey_tochi_600g.jpeg

# 10. Rakkyo 180g
curl -s "https://storage.googleapis.com/farmers-production-b8884/uploads/farmers_product_image/path/47006/thumb_ChatGPT_Image_2025%E5%B9%B410%E6%9C%8828%E6%97%A5_14_13_04.png" -o public/images/products/rakkyo_180g.png

# 11. Mukago 500g
curl -s "https://storage.googleapis.com/farmers-production-b8884/uploads/farmers_product_image/path/47311/thumb_ChatGPT_Image_2025%E5%B9%B411%E6%9C%881%E6%97%A5_07_20_09.png" -o public/images/products/mukago_500g.png

# 12. Satoimo 1kg
curl -s "https://storage.googleapis.com/farmers-production-b8884/uploads/farmers_product_image/path/50056/thumb_easy-banana-2025-11-26T23-17-48-178Z.png" -o public/images/products/satoimo_1kg.png

# 13. Beniharuka Small 1kg
curl -s "https://storage.googleapis.com/farmers-production-b8884/uploads/farmers_product_image/path/40967/thumb_58770_0.jpeg" -o public/images/products/beniharuka_small_1kg.jpeg

# 14. Rakkyo 500g
curl -s "https://storage.googleapis.com/farmers-production-b8884/uploads/farmers_product_image/path/47207/thumb_ChatGPT_Image_2025%E5%B9%B410%E6%9C%8831%E6%97%A5_07_36_55.png" -o public/images/products/rakkyo_500g.png

# 15. Beniharuka New 1.5kg
curl -s "https://storage.googleapis.com/farmers-production-b8884/uploads/farmers_product_image/path/49918/thumb_ChatGPT_Image_2025%E5%B9%B411%E6%9C%8825%E6%97%A5_22_19_40.png" -o public/images/products/beniharuka_1_5kg_new.png

# 16. Negi 10kg B-grade
curl -s "https://storage.googleapis.com/farmers-production-b8884/uploads/farmers_product_image/path/27817/thumb_3814299_0.jpeg" -o public/images/products/negi_10kg_b_grade.jpeg

# 17. Mukago 5kg
curl -s "https://storage.googleapis.com/farmers-production-b8884/uploads/farmers_product_image/path/47980/thumb_65083_0.jpeg" -o public/images/products/mukago_5kg.jpeg

# 18. Mukago 10kg
curl -s "https://storage.googleapis.com/farmers-production-b8884/uploads/farmers_product_image/path/47979/thumb_65083_0.jpeg" -o public/images/products/mukago_10kg.jpeg

# 19. Tokkuri Imo 2kg
curl -s "https://storage.googleapis.com/farmers-production-b8884/uploads/farmers_product_image/path/50090/thumb_easy-banana-2025-11-27T08-01-44-402Z.png" -o public/images/products/tokkuri_imo_2kg.png

echo "All images downloaded."
