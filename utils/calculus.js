function calculus(data) {
  const { height, age, currentWeight, desiredWeight, bloodType } = data;
  // console.log("calculus");

  const BMR_men =
    88.362 + 13.397 * currentWeight + 4.799 * height - 5.677 * age;
  const BMR_women =
    447.593 + 9.247 * currentWeight + 3.098 * height - 4.33 * age;
  const BMR_avg = (BMR_men + BMR_women) / 2;

  const TDEE = BMR_avg * 1.55;

  const weightDifference = currentWeight - desiredWeight;
  const adjustment = weightDifference > 0 ? -500 : 500;

  const dailyCalories = TDEE + adjustment;

  const bloodTypeAdjustment = {
    1: 0,
    2: 50,
    3: 75,
    4: -50,
  };

  const finalCalories = dailyCalories + (bloodTypeAdjustment[bloodType] || 0);

  return finalCalories;
}

module.exports = calculus;

// Alternative:
//
// Mifflin-St Jeor Equation:

// For men:
// BMR = 10W + 6.25H - 5A + 5

// For women:
// BMR = 10W + 6.25H - 5A - 161
