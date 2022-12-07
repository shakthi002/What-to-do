const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const _ = require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB")

const itemsSchema = new mongoose.Schema({
  name:String
 })

const listSchema = new mongoose.Schema({
  name:String,
  items:[itemsSchema]
})

const Item = mongoose.model("Item",itemsSchema)
const List = mongoose.model("List",listSchema)

const item1 = new Item({
  name:"Buy Items"
})

const item2 = new Item({
  name:"Eat Items"
})

const item3 = new Item({
  name:"Cook Food"
})

const def_items = [item1,item2,item3]


app.get("/", function(req, res) {

  Item.find({},(err,foundItems)=>{
    console.log(foundItems)

    if(foundItems.length === 0)
    {
      Item.insertMany(def_items,(err)=>{
        if(err)
        {
          console.log(err)
        }

        else
        {
          console.log("Successful Insertion")
        }
      })
    }

    else
    {
      res.render("list", {listTitle: "Today", newListItems: foundItems})
    }
  })

});


app.get("/:listName",(req,res)=>{
  const listName = _.capitalize(req.params.listName)

  List.findOne({name:listName},(err,result)=>{
    if(!err)
    {
      if(!result)
      {
        //Create a new list
        const list = new List({
          name:listName,
          items:[item1,item2,item3]
        })

        List.insertMany([list],(err)=>{})


        // res.render("list",{listTitle:listName,newListItems:list.items})
        res.redirect("/"+listName)

      }
      else
      {
        res.render("list",{listTitle:result.name,newListItems:result.items})
      }
    }
  })


})



app.post("/", function(req, res){

  // const item = req.body.newItem;

  const item = new Item({name:req.body.newItem})
  const listName = req.body.list

  if(listName === "Today")
  {
    Item.insertMany([item],(err)=>{})
    res.redirect("/")
  }

  else
  {
    List.findOne({name:listName},(err,result)=>{
      result.items.push(item)
      result.save()
      res.redirect("/"+listName)
    })
  }


});


app.post("/delete",(req,res)=>{
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName

  // console.log(req.body)

  if(listName === "Today")
  {
    Item.findByIdAndRemove(checkedItemId,(err)=>{
      if(!err)
      {
        console.log("Successful deletion")
        res.redirect("/")
      }
    })
  }

  else
  {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},(err,result)=>{
      if(!err)
      {
        res.redirect("/"+listName)
      }
    })
  }



})


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
