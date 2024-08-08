export default function () {

    // 将十六进制颜色值转换为RGB数组
    function hexToRgb(hex: string): number[] {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b];
    }

    // 将RGB数组转换回十六进制颜色值
    function rgbToHex(rgb: number[]): string {
        const [r, g, b] = rgb;
        return "#" + r.toString(16).padStart(2, '0') +
            g.toString(16).padStart(2, '0') +
            b.toString(16).padStart(2, '0');
    }

    // 获取两个颜色之间的随机颜色
    function getColor(color1: string, color2: string, factor: number): string {
        const rgb1 = hexToRgb(color1);
        const rgb2 = hexToRgb(color2);
        const factorR = Math.round((1 - factor) * rgb1[0] + factor * rgb2[0]);
        const factorG = Math.round((1 - factor) * rgb1[1] + factor * rgb2[1]);
        const factorB = Math.round((1 - factor) * rgb1[2] + factor * rgb2[2]);
        return rgbToHex([factorR, factorG, factorB]);
    }

    //将rgb转化为lab
    function rgbToLab(rgb: number[]): number[] {
        // 归一化 RGB 值
        const normalRgb = rgb.map(value => value / 255);

        // 伽马校正
        const gammaRgb = normalRgb.map(value => {
            return value > 0.04045 ? Math.pow((value + 0.055) / 1.055, 2.4) : value / 12.92;
        });

        // RGB 到 XYZ 转换
        const xyz: number[] = [0, 0, 0];

        xyz[0] = gammaRgb[0] * 0.4124 + gammaRgb[1] * 0.3576 + gammaRgb[2] * 0.1805;
        xyz[1] = gammaRgb[0] * 0.2126 + gammaRgb[1] * 0.7152 + gammaRgb[2] * 0.0722;
        xyz[2] = gammaRgb[0] * 0.0193 + gammaRgb[1] * 0.1192 + gammaRgb[2] * 0.9505;

        // 白点校正
        const whitePoint = [0.95047, 1.0, 1.08883];
        const correctedXYZ = xyz.map((value, index) => value / whitePoint[index]);

        // 伽马校正（XYZ）
        const gammaCorrectedXYZ = correctedXYZ.map(value => {
            return value > 0.008856 ? Math.pow(value, 1 / 3) : (7.787 * value) + (16 / 116);
        });

        // XYZ 到 Lab 转换
        const lab = [
            116 * gammaCorrectedXYZ[1] - 16,
            500 * (gammaCorrectedXYZ[0] - gammaCorrectedXYZ[1]),
            200 * (gammaCorrectedXYZ[1] - gammaCorrectedXYZ[2])
        ];

        return lab;
    }

    //计算颜色间的欧氏距离，小于20则认为颜色相近
    function colorDistance(color1: string, color2: string): number {
        const rgb1 = hexToRgb(color1);
        const rgb2 = hexToRgb(color2);

        const lab1 = rgbToLab(rgb1);
        const lab2 = rgbToLab(rgb2);

        const [L1, a1, b1] = lab1;
        const [L2, a2, b2] = lab2;

        return Math.sqrt(Math.pow(L1 - L2, 2) + Math.pow(a1 - a2, 2) + Math.pow(b1 - b2, 2));
    }

    return { getColor, colorDistance };
}
