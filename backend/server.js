const express = require('express')
const fs = require('fs')
const path = require('path')
const fileUpload = require('express-fileupload')
const { json } = require('body-parser')
//const cors = require("cors")

const server = express()
const port = 3000

server.use(express.json())
server.use(fileUpload())
//server.use(cors())

server.get('/', (req, res) => {
  res.sendFile(path.join(`${__dirname}/../frontend/pizzas.html`))
})

server.use('/', express.static(`${__dirname}/../frontend`))

server.get('/pizzas', (req, res) => {
    const data = fs.readFileSync(`${__dirname}/../frontend/public/pizzas.json`)
    const pizzas = JSON.parse(data)
    res.json(pizzas)
})

// a leendő ordersData 0. indexű eleme a filenevek tömbje 
// a többi elem egy-egy totalOrder_N json file tartalma
server.get('/orders', (req, res) => {

  const ordersPath = path.join(`${__dirname}/../frontend/public/orders`); 
  const orderFiles = fs.readdirSync(ordersPath, (err, files) => {
      if (err) {
        console.log(err);
      } else {
        console.log("itt vagyok a files-oknál",files);
      }  // I think this is unnecessary...
    });
  console.log("orderFiles",orderFiles);
  
  let allOrders = []
  allOrders.push(orderFiles)
  for (const filename of orderFiles) {
    allOrders.push(JSON.parse(fs.readFileSync(__dirname+"/../frontend/public/orders/"+filename)))
  }
  res.json(allOrders)
})

server.post("/modify", (req, res) => {
  const newPizzasData = JSON.parse(JSON.stringify(req.body))
  const newPizzasDataString = JSON.stringify(newPizzasData, null, 2)
  fs.writeFileSync(path.join(__dirname + "/../frontend/public/pizzas.json"), newPizzasDataString, (err) => {
		if (err) {
			console.log(err);
			return res.status(500).send(err);
		}
	});
	return res.send(newPizzasDataString);
})


server.post("/status", (req, res) => {
  const pack = JSON.parse(JSON.stringify(req.body))
  console.log(pack)

  const filename = pack.filename
  const filecontent = pack.filecontent

  const filecontentString = JSON.stringify(filecontent, null, 2)
  fs.writeFileSync(path.join(__dirname + "/../frontend/public/orders/"+filename), filecontentString, (err) => {
		if (err) {
			console.log(err);
			return res.status(500).send(err);
		}
	});
	return res.send(filecontentString);
})



server.post("/newPizza", (req, res) => {
  const formData = req.body
  console.log("formData",formData)

  const pictureUploadPath1 = __dirname + "/../../order-prototype/Frontend" + formData.imgUrl;
  const pictureUploadPath2 = __dirname + "/../frontend" + formData.imgUrl;

	if (req.files) {
		const uploadedPicture = req.files.picture;
		uploadedPicture.mv(pictureUploadPath1, (err) => {
			if (err) {
				console.log(err);
				return res.status(500).send(err);
			}
		});
    uploadedPicture.mv(pictureUploadPath2, (err) => {
			if (err) {
				console.log(err);
				return res.status(500).send(err);
			}
		});
	}

	fileData = JSON.parse(JSON.stringify(req.body));
  console.log("fileData",fileData);
  
	const uploadPath = __dirname + "/../frontend/public/pizzas.json";
  const originalPizzasJson = JSON.parse(fs.readFileSync(uploadPath))
  
  const newPizzasJson = [...originalPizzasJson, fileData]
  console.log("newPizzaJSON", newPizzasJson)

	const newPizzasJsonString = JSON.stringify(newPizzasJson, null, 2);
  
	fs.writeFileSync(uploadPath, newPizzasJsonString, (err) => {
		if (err) {
			console.log(err);
			return res.status(500).send(err);
		}
	});
	return res.send(newPizzasJsonString);
});



server.listen(port, () => {console.log(`Server running on localhost:${port}`)})
