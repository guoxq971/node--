var express = require('express'); //导入express框架
var bodyParser = require('body-parser'); //http请求参数解析
var app = express(); //生成实例
const https = require('https');
const cheerio = require('cheerio');

// 处理跨域
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  res.header('Access-Control-Allow-Headers', ['mytoken', 'Content-Type']);
  next();
});

//定义接口
app.get('/api/getList', async function (request, response) {
  console.log('请求中');
  const data = await new Promise((resolve, reject) => {
    https.get('https://movie.douban.com/top250', function (res) {
      let html = '';
      const resultList = [];
      // 有数据产生的时候 拼接
      res.on('data', function (chunk) {
        html += chunk;
      });
      // 拼接完成
      res.on('end', function () {
        // console.log('html', html);
        const $ = cheerio.load(html);
        // 每一项
        $('.grid_view li').each(function (index, item) {
          //标题--start
          const titleDOM = $('.title', item);
          const title = [];
          for (let i = 0; i < titleDOM.length; i++) {
            const DOM = titleDOM[i];
            title.push(
              $(DOM)
                .text()
                .replace(/(\s\/\s)/g, ''),
            );
          }
          const otherDOM = $('.other', item);
          title.push(otherDOM.text().replace(/(\s\/\s)/g, ''));
          //标题--end

          // 描述--start
          // .bd p第一个P
          const descDOM = $('.bd p:nth-child(1)', item);
          const desc = descDOM
            .text()
            .split('\n')
            .filter((item) => item.trim());
          // 描述--end

          // 评价--start
          const star = $('.rating_num', item).text();
          // 评价--end

          // 评价人数--start
          // .start 中的最后一个span
          const startNumDOM = $('.star span:last-child', item);
          const startNum = startNumDOM.text();
          // 价格--end

          // 评语--start
          const quoteDOM = $('.quote span', item);
          const quote = quoteDOM.text();
          // 评语--end

          resultList.push({
            title,
            desc,
            star,
            startNum,
            quote,
          });
        });
        resolve(resultList);
      });
    });
  });
  response.send(data);
});

app.listen(3000, function () {
  console.log('Node服务已启动');
});
