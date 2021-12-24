import React, { useState } from 'react';
import { render } from 'react-dom';
import Hello from './Hello';
import './style.css';

interface AppProps {}
interface AppState {
  name: string;
}

const App = () => {
  const [param, setParam] = useState(
    "Microsoft.EntityFrameworkCore.Database.Command: Error: Failed executing DbCommand (4ms) [Parameters=[@p0='aaa' (Size = 4000), @p1='2021-12-23T12:32:27.6940832+09:00' (Nullable = true), @p2=NULL (Size = 4000), @p3='False', @p4=NULL (Size = 4000), @p5='2', @p6=NULL (DbType = DateTime2), @p7=NULL (Size = 4000), @p8='http://www.yahoo.co.jp/' (Size = 4000), @p9='0', @p10='0001-01-01T00:00:00.0000000', @p11=NULL (Size = 4000)], CommandType='Text', CommandTimeout='30']"
  );
  const [query, setQuery] = useState(
    'INSERT INTO [M_ALTERYX_SERVER] ([Comment], [CreateDate], [CreateUser], [DeleteFlg], [Note], [Seq], [UpdateDate], [UpdateUser], [Url], [WfId], [WfUpdateDate], [WfVersion]) \n  VALUES (@p0, @p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11);'
  );
  const [result, setResult] = useState('');

  const foo = (_) => {
    let p = /(@p[0-9]+=[^, ]+)[, ]/g;
    let b = param.match(p);
    console.log(b);
    const c = b.map((i) => {
      const key = i.replace(/=.*$/g, '');
      const obj = {};
      obj[key] = i
        .replace(/@p[0-9]+=/, '')
        .replace(/,$/, '')
        .trim();
      return obj;
    });
    let r = query;
    c.forEach((x) => {
      Object.entries(x).forEach(([key, value]) => {
        console.log(key);
        console.log(value);
        let regexp = new RegExp(key);
        r = r.replace(regexp, value);
      });
    });
    setResult(formatSql(r));
  };

  return (
    <div className="App">
      <p>
        efのログは(なにか)見にくいので、ログ(クエリ、パラメータ)から見やすいSQLを作成します
      </p>
      <h1>EFのログのパラメータの行を貼り付ける</h1>
      <textarea
        rows="10"
        cols="72"
        value={param}
        onChange={(e) => setParam(e.target.value)}
      />
      <h1>EFのログのクエリの行を貼り付ける</h1>
      <textarea
        rows="10"
        cols="72"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <br />
      <button onClick={() => foo()}>↓↓↓見やすいSQLに変換↓↓↓</button>
      <br />
      <h1>結果</h1>
      <textarea rows="20" cols="72" value={result} />
    </div>
  );
};

render(<App />, document.getElementById('root'));

// https://qiita.com/e99h2121/items/84e7c53871bbe647447e
function formatSql(text) {
  // 改行するキーワード
  var array = [
    'AND',
    'FROM',
    'FULL',
    'GROUP',
    'INNER',
    'LEFT',
    'ON',
    'ORDER',
    'RIGHT',
    'SET',
    'WHERE',
    'VALUES',
  ];

  // キーワード共通処理
  for (let i = 0; i < array.length; i++) {
    var keyword = array[i];
    var after = ' ' + keyword + ' ';

    // キーワード前後の半角スペースを1つだけにする
    // 例: キーワード"   AND  "は" AND "になる
    text = text.replace(new RegExp(' +' + keyword + ' +', 'gi'), after);

    // 改行
    var afterRn = '\r\n' + after;
    text = text.replace(new RegExp(after, 'gi'), afterRn);
  }

  // SELECT：後ろ改行
  text = text.replace(/SELECT/gi, 'SELECT\r\n');

  // カンマ：前後のスペース削除
  text = text.replace(/( +,|, +| +, +)/gi, ',');
  // カンマ：改行（前カンマ）
  text = text.replace(/,/g, '\r\n , ');

  // かっこ：改行
  text = text.replace(/\(/g, '(\r\n');
  text = text.replace(/\)/g, '\r\n)\r\n');

  return text;
}
