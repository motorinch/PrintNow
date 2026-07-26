// cloudfunctions/parseFile/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  const { fileID, fileName } = event;
  const ext = (fileName || '').split('.').pop().toLowerCase();

  try {
    // 对于PDF，尝试下载并解析页数（可用pdf-parse等库）
    // 对于其他格式（Word/PPT/Excel），返回默认页数或估算
    // 云函数环境限制：Node.js运行时，可安装npm包

    let pages = 1;

    if (ext === 'pdf') {
      try {
        const res = await cloud.downloadFile({ fileID });
        // 简易PDF页数统计：搜索 /Page 关键字出现次数
        const buffer = res.fileContent;
        const text = buffer.toString('utf-8').slice(0, 50000);
        const pageMatches = text.match(/\/Type\s*\/Page[^s]/g);
        pages = pageMatches ? pageMatches.length : 1;
      } catch (e) {
        console.log('PDF解析失败，默认1页:', e.message);
      }
    } else if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext)) {
      // Office文件默认估算10页（后续可接入第三方API精确解析）
      pages = 10;
    } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
      pages = 1; // 每张图片算1页
    }

    return { success: true, pages, fileName, fileID };
  } catch (e) {
    console.error('parseFile error:', e);
    return { success: false, pages: 1, fileName, fileID, error: e.message };
  }
};
