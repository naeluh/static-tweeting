import fetch from '../fetch';
import botometer from 'node-botometer';

const B = new botometer({
  consumer_key: '',
  consumer_secret: '',
  access_token: null,
  access_token_secret: null,
  app_only_auth: true,
  mashape_key: '',
  rate_limit: 0,
  log_progress: true,
  include_user: true,
  include_timeline: false,
  include_mentions: false
});

const url = `https://botometer10.p.rapidapi.comhttps//osome-botometer.p.rapidapi.com`;
const config = {
  method: 'GET',
  headers: {
    'x-rapidapi-host': 'botometer10.p.rapidapi.com',
    'x-rapidapi-key': '6202dbe116mshba3ce7e627eec90p12a7dfjsn494908e87998'
  }
};

export async function fetchTweetBotData (url) {
  if (!url.startsWith('https://twitter.com/')) {
    throw new Error(`The url "${url}" does not match a Twitter thread`);
  }

  const res = await fetch(url);

  if (res.ok) return res.text();
  if (res.status === 404) return {};

  throw new Error(
    `Fetch for the Twitter thread of "${url}" failed with code: ${res.status}`
  );
}

function twitterLabsEnabled (expansions) {
  if (!process.env.TWITTER_LABS_ENABLED) return false;
  if (!expansions) return true;

  const exp = process.env.TWITTER_LABS_EXPANSIONS || '';

  return exp.includes(expansions);
}

export async function fetchTweetHtml (url) {
  if (!url.startsWith('https://twitter.com/')) {
    throw new Error(`The url "${url}" does not match a Twitter thread`);
  }

  const res = await fetch(url);

  if (res.ok) return res.text();
  if (res.status === 404) return {};

  throw new Error(
    `Fetch for the Twitter thread of "${url}" failed with code: ${res.status}`
  );
}

export async function fetchUserStatus (tweetId) {
  // If there isn't an API token don't do anything, this is only required for videos.
  if (!process.env.TWITTER_API_TOKEN) return;

  const res = await fetch(
    `${API_URL}/1.1/statuses/show/${tweetId}.json?include_entities=true&tweet_mode=extended`,
    {
      headers: {
        authorization: `Bearer ${process.env.TWITTER_API_TOKEN}`
      }
    }
  );

  console.log(
    'Twitter x-rate-limit-limit:',
    res.headers.get('x-rate-limit-limit')
  );
  console.log(
    'Twitter x-rate-limit-remaining:',
    res.headers.get('x-rate-limit-remaining')
  );
  console.log(
    'Twitter x-rate-limit-reset:',
    res.headers.get('x-rate-limit-reset')
  );

  if (res.ok) return res.json();
  if (res.status === 404) return;

  throw new Error(`Fetch to the Twitter API failed with code: ${res.status}`);
}

export async function fetchTweetWithPoll (tweetId) {
  const expansions = 'attachments.poll_ids';

  // If there isn't an API token or Twitter Labs is not enabled, don't do anything,
  // this is only required for Polls.
  if (!process.env.TWITTER_API_TOKEN || !twitterLabsEnabled(expansions)) return;

  const res = await fetch(
    `${API_URL}/labs/1/tweets?format=compact&expansions=${expansions}&ids=${tweetId}`,
    {
      headers: {
        authorization: `Bearer ${process.env.TWITTER_API_TOKEN}`
      }
    }
  );

  console.log(
    'Twitter Labs x-rate-limit-limit:',
    res.headers.get('x-rate-limit-limit')
  );
  console.log(
    'Twitter Labs x-rate-limit-remaining:',
    res.headers.get('x-rate-limit-remaining')
  );
  console.log(
    'Twitter Labs x-rate-limit-reset:',
    res.headers.get('x-rate-limit-reset')
  );

  if (res.ok) return res.json();
  if (res.status === 404) return;

  throw new Error(
    `Fetch to the Twitter Labs API failed with code: ${res.status}`
  );
}

export async function getEmbeddedTweetHtml (url) {
  const res = await fetch(`https://publish.twitter.com/oembed?url=${url}`);

  if (res.ok) return res.json();
  if (res.status === 404) return;

  throw new Error(`Fetch for embedded tweet failed with code: ${res.status}`);
}
