addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});


async function handleRequest(request) {

  let html_content = '';
  let html_style = `body{padding:6em; font-family: sans-serif;} h1{color:#f6821f}`;

  const weekMap = {
  0: 'Sun',
  1: 'Mon',
  2: 'Tue',  
  3: 'Wed',
  4: 'Thur',
  5: 'Fri',  
  6: 'Sat'
  };

  const timezone = request.cf.timezone;
  let score = request.cf.botManagement.score;
  let asn = request.cf.asn;
  let org = request.cf.asOrganization;
  let colo = request.cf.colo;
  let localized_date = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
  let month = localized_date.getMonth() + 1;
  let date = localized_date.getDate();
  let hour = localized_date.getHours();
  let minutes = localized_date.getMinutes();
  let day = localized_date.getDay();
  day = weekMap[day];

  let endpoint = 'https://api.waqi.info/feed/geo:';
  const token = 'd36cb072700beec5210b2eff558468f84f99641f';
  latitude = request.cf.latitude;
  longitude = request.cf.longitude;
  endpoint += `${latitude};${longitude}/?token=${token}`;
  let init = {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  };

  const response = await fetch(endpoint, init);
  const content = await response.json();

  html_content += '<h1>' + month + "/" + date + "  " + day + "  " + hour + ':' + minutes + '</h1>';
  html_content += '<p>' + "Timezone: " + timezone + '<br/></p>';

  html_content += `<p>Based off sensor data from <a href="${content.data.city.url}">${content.data.city.name}</a>:</p>`;
  html_content += `<p>The AQI level is: ${content.data.aqi}</p>`;
  html_content += `<p>The Ozone level is: ${content.data.iaqi.o3?.v}</p>`;
  html_content += `<p>The Rain (precipitation) is: ${content.data.iaqi.r?.v}.</p>`;
  html_content += `<p>The Wind level is: ${content.data.iaqi.w?.v} (0-12)</p>`;
  html_content += `<p>The Relative Humidity is: ${content.data.iaqi.h?.v}%</p>`;
  html_content += `<p>The temperature is: ${content.data.iaqi.t?.v}°C.</p>`;  
  html_content += `<h1>My bot socre is: ${score} </h1>`;
  html_content += `<p>My ASN is: ${asn} - ${org}</p>`;
  html_content += `<p>Colo: ${colo} ; ${request.cf.httpProtocol} ; ${request.cf.tlsVersion}</p>`;
  
  //score = 0;

    if (score <= 30) {
      // Define JSON result
      let jsonRes = JSON.stringify({
        result: {
          code: 403,
          reason: "You are bad bot!",
          my_BotScore: score
        },
      });
      // Define the INIT object
      let init = {
        status: 403,
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
      };
      // Create a response object that has a JSON indicating the request is being blocked and why
      res = new Response(jsonRes, init);
      return res;
    } else {

      let html = `
      <!DOCTYPE html>
      <head>
        <title>project</title>
      </head>
      <body>
        <style>${html_style}</style>
        <div id="container">
        ${html_content}
        </div>
      </body>`;

      return new Response(html, {
        headers: {
          'content-type': 'text/html;charset=UTF-8',
        },
      });
     } 
}