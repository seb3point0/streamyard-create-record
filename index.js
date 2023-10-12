const axios = require('axios');

const createBroadcast = async (headers, title, workspaceId, selectedBrandId, csrfToken) => {
  const url = `https://streamyard.com/api/workspaces/${workspaceId}/broadcasts`;
  const data = { 
    title, 
    selectedBrandId, 
    csrfToken, 
    recordOnly: true, 
    type: 'studio', 
    localIsolatedRecordings: 'audioAndVideo' 
  };

  try {
    const result = await axios.post(url, data, { headers });
    return result.data.id;
  } catch (error) {
    console.error('Error creating broadcast:', error);
    throw error;
  }
};

exports.handle = async (event, context, callback) => {
  try {
    const params = event.queryStringParameters;
    const headers = {
      'authority': 'streamyard.com',
      'accept': '*/*',
      'accept-language': 'en-GB,en;q=0.9',
      'content-type': 'application/json',
      'cookie': params.cookies,
      'origin': 'https://streamyard.com',
      'referer': params.referer,
      'referrer-policy': 'origin-when-cross-origin',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'sec-gpc': '1',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
    };

    const broadcast = await createBroadcast(headers, params.title, params.workspaceId, params.selectedBrandId, params.csrfToken);
    
    const response = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: 'https://streamyard.com/' + broadcast })
    };

    callback(null, response);
  } catch (error) {
    console.error('Error handling request:', error);

    const errorResponse = {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Internal Server Error' })
    };

    callback(null, errorResponse);
  }
};

if (process.env.NODE_ENV === 'test') {
  const scw_fnc_node = require('@scaleway/serverless-functions');
  scw_fnc_node.serveHandler(exports.handle, 8080);
}
