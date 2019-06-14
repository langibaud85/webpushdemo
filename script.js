var payload = {
    a: 1,
    b: 2
};

var data = new FormData();
data.append("json", JSON.stringify(payload));

fetch("http://localhost/index.php/", {
        method: "POST",
        body: data
    })
    .then(res => res.text())
    //.then(r => console.log(r.trim()+'rr'))
    //.then(resp => console.log(JSON.parse('{"name":"John", "age":30, "city":"New York"}')))
    .then (resp => console.log(JSON.parse(resp.trim())));
