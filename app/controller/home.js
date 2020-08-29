class HomeController {
  index(ctx) {
    ctx.body = '<h1>这里是根目录</h1>';
  }
}

module.exports = new HomeController