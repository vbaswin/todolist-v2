const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

const mongoose = require('mongoose');
const { promiseImpl } = require("ejs");

const _ = require('lodash');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.set('view engine', 'ejs');


main();

async function main() { // main async function

await mongoose.connect("mongodb+srv://admin-aswin:test123@cluster0.sswlq3w.mongodb.net/todolistDB");
// await mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemsSchema = {
    name: String
};

const Item = mongoose.model("item", itemsSchema);

const item1 = new Item({
    name: "Meditate"
});

const item2 = new Item({
    name: "Do presentation"
});

const item3 = new Item({
    name: "Program"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const CustomList = mongoose.model("customlist", listSchema);


app.get("/", function(req, res) {
        Item.find({}, function(err, foundItems) {
            if (foundItems.length == 0) { 
                Item.insertMany(defaultItems, function(err) {
                    if (err) {
                        console.log(err)
                    }
                    else {
                        console.log("Successfully saved default item to DB!");
                        res.redirect("/");
                    }
                });
            } else {
                res.render("list", {listTitle: "Today", newListItems: foundItems})
            }
        });
});   

app.post("/", function(req, res) {
    // console.log(req.body);
    const itemName = req.body.newItem;
    const listTitle = req.body.list;

    const newItem = new Item ({
        name: itemName
    });

    if (listTitle === "Today") {
        newItem.save(function(err) {
            res.redirect("/");
        });
    } else {
        CustomList.findOne({name: listTitle}, function(err, foundList) {
            if (!err) {
                foundList.items.push(newItem);
                foundList.save(function(err) {
                    res.redirect("/" + listTitle);
                });
            } else {
                console.log("Cannot find or push to the required item!");
            }
        })
    }

});



app.get("/:listName", function(req, res) {
    const customListName = _.capitalize(req.params.listName);

    async function f1() {

        var listItems = [];
        await CustomList.findOne({name: customListName}, function(err, foundItem) {
            if (!err)  {
                if (foundItem) {
                    listItems = foundItem.items;
                    res.render("list", {listTitle: customListName, newListItems: listItems});
                } else {
                    const newCustItem = new CustomList({
                        name: customListName,
                        items: defaultItems
                    })
                    listItems = defaultItems;
            
                    newCustItem.save(function(err) {
                        res.render("list", {listTitle: customListName, newListItems: listItems});
                        return;
                    });      // don't forget to save to save in the collection
                }
            }
        }).clone();
    }
    f1();
});

app.post("/work", function(req, res) {
    const item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
});

app.post("/delete", function(req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    
    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Successfully found and removed!");
                res.redirect("/");
            }
        });
    } else {
    //     CustomList.findOne({name: listTitle}, function(err, foundList) {
    //         console.log(foundList);
    //         // if (!err) {
    //         //     for (var i = 0; i < foundList.items.length; ++i) {
    //         //         if (foundList.items[i].id === checkedItemId) {
    //         //             foundList.items.splice(i,1);
    //         //         }
    //         //     }
    //         //     res.redirect("/" + listTitle);
    //         // } else {
    //         //     console.log("Cannot find the req title!");
    //         // }
    //     }) 

        console.log("hi");
        CustomList.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList) {
            if (!err) { 
                res.redirect("/" + listName);
            }
        });
    }
});

app.get("/about", function(req, res) {
    res.render("about");
})

app.listen(3000, function() {
    console.log("Server is running in port 3000");
})

}