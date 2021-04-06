const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));
const nextId = require("../utils/nextId");



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
    const {data: {name, description, price, image_url } = {} } = request.body;
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
    if(price <= 0 || !Number.isInteger(price)){
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
    return next();
}

function idCheck(request, response, next){
    if(!request.body.data.id) return next();
    if(request.body.data.id !== request.params.dishId){
        return next({
            status: 400,
            message: `Dish id: ${request.body.data.id} does not match route id: ${request.params.dishId}`
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
    const { name, description, price, image_url } = request.body.data;
    const { dish } = response.locals;
    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;
    response.json({data: dish})
}


module.exports = {
    list,
    create: [validateDish, create],
    read: [getDishById, read],
    update: [getDishById, validateDish, idCheck, update],
}