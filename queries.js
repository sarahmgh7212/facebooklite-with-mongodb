

/////////////////////////////

//)Insert a new member in the database
    db.Member.insert({
    Email:"user5@yahoo.com",
    Fullname:"user5 uii",
    ScreenName:"user500",
    DOB:"1989-09-03",
    Password:"1234",
    Gender:"Male",
    Status:"Married",
    Location:"Bendigo",
    Visibility:"Public"  
    })
//////////////////////////////////

//Application Home Page:

//1)	Check if a specific username(Email) exists:
db.Member.find({Email:"user1@yahoo.com"},{_id:1})

//2) 	Check if the password for the specified user exists:

db.Member.find(
{Email:"user1@yahoo.com",
 Password:"1234"}
,
{_id:1}
)

////////////////////////////////////

//Main Page:
//1)	Query to show posts of a given user:
db.Post.find(
{ Member_email:"parvi@yahoo.com "},
{_id:0,PostID:0,Member_email:0}
).pretty()

//2)	Query to show friends of a given username:

db.Member.find(
{Email:"user1@yahoo.com"}, 
{_id:0, Friends:1}
).pretty()

//3)	Query to show posts, posted by friends of a user:
db.Member.find(
    {Email:"user1@yahoo.com"},
    {_id:0,Friends:1}
    )
//Then show posts which belong to those email addresses(friends’ emails):
db.Post.aggregate([
    {
        $match:
    {Member_email:
        {
            $in:["user2@yahoo.com","user4@yahoo.com"]
        }
        }
        }
        ,{$project:
        {Body:1,Member_email:1}
        }
        ]).pretty()

//4)	Query to add a like to a friend’s post:
//First check if such user has liked that specific post before
//Then if such record doesn’t exist, add the member email and post id to Likes collection
db.Likes.find({
    Member_email:"user1@yahoo.com",
    PostID:"1200" 
})
db.Likes.insert({
    Member_email:"user1@yahoo.com",
    PostID:"1200"
    })

//5)	 Query to generate a new post by a user:
 db.Post.insertOne({
Member_email:"user2@yahoo.com",
 Body: "I'm posting again as user2!"
,PostTimestamp:"2020-10-02"

})
//6)	Query to create a response to a post:
db.Post.update(
     {PostID:"1400"},
    {$push:
{Comment: 
{$each:
[{CoID:"6024",
Member_email:"user1@yahoo.com",
 CoBody:"It's good to hear from you"}]}}}
)
  // 7) Query to mimic sending a friendship request to a non-friend user:
//First check if such a friendship exist in database, either ‘pending’ or ‘approved’
//Then if such record is not found the collection, add that to the collection as ‘pending’

db.Friendship.find({
    $or:[
        
    {Requester:"user3@yahoo.com",
    Receiver:"user4@yahoo.com",
    status:"pending"
    }
    ,
   {Requester:"user4@yahoo.com",
    Receiver:"user3@yahoo.com",
    status:"pending"
   }
   ,
   {
    Requester:"user3@yahoo.com",
    Receiver:"user4@yahoo.com",
    status:"approved"
   }
   ,
   {Requester:"user4@yahoo.com",
    Receiver:"user3@yahoo.com",
    status:"approved"
   }
 ]
})
db.Friendship.insert({
    Requester:"Jacksparrow@yahoo.com",
    Receiver:"maria@yahoo.com",
    status:"pending"
    })


//8) Query to accept a pending friendship request:
//First check if such friendship exist and the status is ‘pending’, if found then update the status to ‘approved’

db.Friendship.find({
Receiver:"maria@yahoo.com",
Requester:"jacksparrow@yahoo.com"
},
{_id:1}
)
.pretty()
//Update the status of their friendship to “approved”
db.Friendship.updateOne(
    {"_id" : ObjectId("5e350352f83272de0ec9c3a6")},
     {$set:{
            status:"approved"
    }}
)

//Then add both of them as friends(in Friends array) in Member collection:
db.Member.update(
    {Email:"user3@yahoo.com"},
    {$push:{Friends:{$each:["user4.com"]}}}
)
db.Member.update(
     {Email:"user4@yahoo.com"},
    {$push:{Friends:{$each:["user3@yahoo.com"]}}}
)


//9) Query to un-friend a friend:
//First check if such friendship exists (the friendship status is “approved”), then if exists remove that document
db.Friendship.find({
    $or:[
   {
    Receiver:"user3@yahoo.com",
    Requester:"user4@yahoo.com",
    status:"approved"
   }
   ,
   {Receiver:"user4@yahoo.com",
    Requester:"user3@yahoo.com",
    status:"approved"
   }
 ]
})

db.Friendship.remove({
    _id:ObjectId("5e33e1520ac4741ed0bdcf07")
})

//Also we need to remove both users from ‘Friends’ field in Member collection as well
db.Member.updateOne(
    {Email:"user3@yahoo.com"},
    {$pull:{Friends:{$in:["user4@yahoo.com"]}}}
    )
db.Member.updateOne(
    {Email:"user4@yahoo.com"},
    {$pull:{Friends:{$in:["user3@yahoo.com"]}}}
    )


db.Member.aggregate([
    {$match: {
        $and:[
            {visibility:"friends"}, }
            ]}
            },
            
            

])

//10)Show posts of a user's friends whose visbility is "friends-only"
db.Member.aggregate([
    {$match:{$and:[{Visibility:"friendsonly"}, {Email:{$in:userobj.Friends} }]
            }
    },
    {
        $lookup:{
            from:'Post',
            localField:'Email',
            foreignField:'Member_email',
            as:'friend-posts'
    
        }
    },
    {
        $group:{
        _id:"$_id",
        posts:{
            $push:{
                Body:'$friend-posts.Body',
                Member_email:'$friend-posts.Member_email',
                
                
            }
        }
    }
    }
            
            

]);



 //11)show user posts whose visibility is "public"   
let userobj=db.Member.findOne({Email:"parvi@yahoo.com"});


db.Member.aggregate([
    {$match:{Visibility:"public"}
            
    },
    {
        $lookup:{
            from:'Post',
            localField:'Email',
            foreignField:'Member_email',
            as:'people-posts'
    
        }
    },
    {
        $group:{
        _id:"$_id",
        posts:{
            $push:{
                Body:'$people-posts.Body',
                Member_email:'$people-posts.Member_email',
                
                
            }
        }
    }
    }
            
            

]);
