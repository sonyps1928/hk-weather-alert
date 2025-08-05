const fetch = require('node-fetch');

async function checkWarning() {
  const res = await fetch('https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warnsum&lang=en');
  const data = await res.json();
  
  const warnings = [];
  if (data.WL) {
    warnings.push(data.WL.name);
  }
  if (data.WTS) {
    warnings.push(data.WTS.name);
  }

  return warnings.length > 0 ? warnings.join(', ') : null;
}

async function sendSlackNotification(message) {
  const res = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SLACKTOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel: 'YOURCHANNELID',
      text: `⚠️ Weather Warning: ${message}`
    }),
  });
  return res.json();
}

(async () => {
  const warnings = await checkWarning();
  if (warnings) {
    await sendSlackNotification(warnings);
  }
})();