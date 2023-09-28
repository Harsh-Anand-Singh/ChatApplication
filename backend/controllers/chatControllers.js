const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

//---------------------------------------------------------------------------------------------
//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected
const accessChat = asyncHandler(async (req, res) => {
  //Get the user id from the request
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  //Checking if the chat already exists between the two users
  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      //NOTE: $elemMatch is used to match the elements of an array
      //basically the below line says, 'match a element($elemMatch) in the array(users)
      //which is equal($eq) to the user._id'
      { users: { $elemMatch: { $eq: req.user._id } } }, //req.user._id is the logged in user
      { users: { $elemMatch: { $eq: userId } } }, //userId is the user we want to chat with

      //In the above lines, we are checking if both the users are present in the chat
      //If they are present, then we have a chat between them
    ],
  })
    .populate("users", "-password") //NOTE: -password means exclude password
    .populate("latestMessage");
  //Once we have the chat, we need to populate the users and latestMessage fields
  //The populate method is used to populate the fields with the data from the referenced model

  //---------------{ LEFT OUT CODE WHICH IS NOT REQUIRED </> }----------------

  //since isChat is an array of collections(in this case, we get only one),So we need to check if it is empty or not
  if (isChat.length > 0) {
    //If it's not empty, then we have a chat between the two users, so we return the chat
    res.send(isChat[0]);
  } else {
    //If the chat does not exist, then we create a new chat
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      //This is for creating a new chat with chatData as the data
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});
//---------------------------------------------------------------------------------------------
//@description     Fetch all chats that the currently logged in user is a part of
//@route           GET /api/chat/
//@access          Protected
const fetchChats = asyncHandler(async (req, res) => {
  try {
    await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      //The above line says, 'find a chat collection, in which the user._id is present in the users array'
      //basically find a Chat --> users --> user._id, The Chat.find() will returns
      //an array chat collection not users array or anyting else.
      //after that we need to populate the users, groupAdmin and latestMessage fields
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      //sort the chats by the latestMessage timestamp
      .sort({ updatedAt: -1 })

      //---------------{ LEFT OUT CODE WHICH IS NOT REQUIRED </> }----------------

      .then(async (results) => {
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
//---------------------------------------------------------------------------------------------
//@description     Create New Group Chat
//@route           POST /api/chat/group
//@access          Protected
const createGroupChat = asyncHandler(async (req, res) => {
  //A group chat requires a name and a list of users

  //So, we are checking if the name and users are present in the request
  if (!req.body.users || !req.body.name) {
    //if there is no name or users, then will return(eding the request)
    return res.status(400).send({ message: "Please Fill all the feilds" });
  }

  //The below line executes if the name and users are present in the request
  //We are going to send string data from the frontend, so we need to convert it to an JSON array at the backend
  var users = JSON.parse(req.body.users);

  //A group chat requires atleast 2 users, so we are checking if the users array has atleast 2 users
  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  //We are adding the currently logged in user to the users array as well, since he is also a part of the group chat
  //Below req.user is the currently logged in user
  users.push(req.user);

  //If everything is fine, then we come to this line where we create a new group
  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      //group admin is the user who is currently logged in, cuz he is the one who is creating the group
      groupAdmin: req.user,
    });

    //Once it's created in database, we are fetching the same from the database and sending it to the frontend(client)
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
//---------------------------------------------------------------------------------------------
// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Protected
const renameGroup = asyncHandler(async (req, res) => {
  //We are taking the chatId and the new name from the request
  const { chatId, chatName } = req.body;

  //Then we are finding the chat with the chatId and updating the chatName
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId, //field to find i.e chatId
    {
      chatName: chatName, //field to update i.e chatName
    },
    {
      new: true, //this should be true, so that we get the new(updated) chat
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedChat);
  }
});
//---------------------------------------------------------------------------------------------
// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove
// @access  Protected
const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
});
//---------------------------------------------------------------------------------------------
// @desc    Add user to Group / Leave
// @route   PUT /api/chat/groupadd
// @access  Protected
const addToGroup = asyncHandler(async (req, res) => {
  //Get the chatId and the userId from the request
  //chatId the chatId of the group chat
  //userId the userId of the user who is to be added to the group
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
//---------------------------------------------------------------------------------------------
