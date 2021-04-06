const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function getDishById(request, response, next){
    const { dishId } = request.params;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    if(foundDish){
        response.locals.dish = foundDish;
        return next();
    }
    next({
        status: 404,
        message: "Dish not found"
    })
}

function validateDish(request, response, next){
    const {data: {id, name, description, price, image_url } = {} } = request.body;
    if(!name || name === ""){
        next({
            status: 400,
            message: "Dish must include a name"
        })
    }
    if(!description || description === ""){
        next({
            status: 400,
            message: "Dish must include a description"
        })
    } 
    if(!price){
        next({
            status: 400,
            message: "Dish must include a price"
        })
    }
    if(price <= 0 || !Number.isInterget(price)){
        next({
            status: 400,
            message: "Dish must have a price that is an integer greater than 0"
        })
    }
    if(!image_url || image_url === ""){
        next({
            status: 400,
            message: "Dish must include a image_url"
        })
    }
    next();
}

function list(request, response, next){
    response.json({ data: dishes })
}

function create(request, response, next){
    const { data: { id, name, description, price, image_url } = {} } = request.body;
    const newDish = {
        id: nextId(),
        name,
        description,
        price,
        image_url,
    };
    dishes.push(newDish);
    response.status(201).json({data: newDish});
}

function read(request, response, next){
    response.json({ data: response.locals.dish})
}

function update(request, response, next){
    return;
}


module.exports = {
    list,
    create: [validateDish, create],
    read: [getDishById, read],
    update,
}