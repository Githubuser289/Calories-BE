const Product = require("../models/products");

const notRecomProducts = async () => {
  try {
    let bloodType = 1;
    console.log("typeof bloodType=", typeof bloodType);
    let counter = 1;
    let prodList = await Product.find({
      categories: "cereals",
    });
    console.log("type=", typeof prodList);
    // const notRecomList = prodList.filter((item) => {
    //   if (counter === 1) {
    //     console.log(item.groupBloodNotAllowed);
    //     counter++;
    //   }
    //   item.groupBloodNotAllowed[bloodType] === true;
    // });
    const notRecomList = prodList.filter(
      (item) => item.groupBloodNotAllowed[1] === true
    );
    console.log("list=", notRecomList);
    return notRecomList;
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  notRecomProducts,
};
