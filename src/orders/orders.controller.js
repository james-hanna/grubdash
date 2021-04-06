const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function orderCheck(request, response, next) {
  const { orderId } = request.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    response.locals.order = foundOrder;
    return next();
  }
  next({
    status: 404,
    message: `Order ${orderId} does not exist.`,
  });
}

function idCheck(request, response, next) {
    if(!request.body.data.id) return next();
    if(request.body.data.id !== request.params.orderId){
        return next({
            status: 400,
            message: `Order id: ${request.body.data.id} does not match route id: ${request.params.orderId}.`
        })
    }
    next();
}

function validateOrder(request, response, next) {
  const {
    data: { deliverTo, mobileNumber, dishes },
  } = request.body;
  if (!deliverTo || deliverTo === "") {
    next({
      status: 400,
      message: "Order must include a deliverTo",
    });
  }
  if (!mobileNumber || mobileNumber === "") {
    next({
      status: 400,
      message: "Order must include a mobileNumber",
    });
  }
  if (!dishes || !Array.isArray(dishes) || dishes.length <= 0) {
    next({
      status: 400,
      message: "Order must include at least one dish",
    });
  }
  dishes.forEach((dish, index) => {
    if (
      !dish.quantity ||
      typeof dish.quantity !== "number" ||
      dish.quantity - Math.floor(dish.quantity) !== 0 ||
      dish.quantity < 1
    ) {
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  });

  next();
}

function list(request, response, next) {
  response.json({ data: orders });
}

function create(request, response, next) {
  const {
    data: { deliverTo, mobileNumber, status, dishes } = {},
  } = request.body;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  orders.push(newOrder);
  response.status(201).json({ data: newOrder });
}

function read(request, response, next) {
  response.json({ data: response.locals.order });
}

function update(request, response, next) {
  const { deliverTo, mobileNumber, dishes } = request.body.data;
  const { order } = response.locals;
  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.dishes = dishes;
  response.json({ data: order });
}

function checkUpdateStatus(request, response, next) {
  const orderToUpdate = request.body.data;
  if (!orderToUpdate.status || orderToUpdate.status === "invalid") {
    return next({
      status: 400,
      message: "A pending status is required to update an order.",
    });
  }
  next();
}

function destroy(request, response, next) {
    const index = orders.findIndex((order) => order.id === response.locals.order.id);
    const deleteOrder = orders.splice(index, 1);
    response.sendStatus(204);
}

function checkDestroyStatus(request, response, next) {
    const order = response.locals.order;
    if(order.status !== "pending") {
        return next({
            status: 400,
            message: "An order must be pending to Delete"
        })
    }
    next();
}

module.exports = {
  list,
  create: [validateOrder, create],
  read: [orderCheck, read],
  update: [orderCheck, validateOrder, checkUpdateStatus, idCheck, update],
  delete: [orderCheck, checkDestroyStatus, destroy],
};
