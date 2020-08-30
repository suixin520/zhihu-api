const path = require('path');
class HomeController {
  index(ctx) {
    ctx.body = '<h1>这里是根目录</h1>';
  }
  upload(ctx) {
    const file = ctx.request.files.file;
    const baseName = path.basename(file.path);
    ctx.body = { url: `${ctx.origin}/uploads/${baseName}` };
  }
}

module.exports = new HomeController