
export default function () {

    //创建一个svg画布并设置属性
    const customSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    customSvg.setAttribute("width", "100%");
    customSvg.setAttribute("height", "100%");
    customSvg.setAttribute("id", "svg"); // 设置 ID

    // 创建一个矩形元素并设置其大小和位置
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("width", "100%");
    rect.setAttribute("height", "100%");
    rect.setAttribute("fill", "#2b2b2b");
    rect.setAttribute("visibility", "hidden");
    rect.setAttribute("id", "rect"); // 设置 ID


    const img = document.createElementNS("http://www.w3.org/2000/svg", "image");
    // 设置图像元素的属性
    img.setAttribute("x", "96%");
    img.setAttribute("y", "3");
    img.setAttribute("width", "25");
    img.setAttribute("height", "25");
    img.setAttribute("href", "http://localhost:5173/src/image/ZoomOut.svg");
    img.setAttribute("visibility", "hidden");
    img.setAttribute("id", "img"); // 设置 ID

    //矩形和图片添加到svg画布中
    customSvg.appendChild(rect);
    customSvg.appendChild(img);

    return { customSvg };

}