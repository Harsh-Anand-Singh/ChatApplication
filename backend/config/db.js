const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect("mongodb+srv://harsh786anand:<Qwerty12345.>@chat.oskeaqk.mongodb.net/?retryWrites=true&w=majority", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;
