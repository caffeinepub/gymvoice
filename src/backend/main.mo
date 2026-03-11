import Text "mo:core/Text";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";

actor {
  type Category = {
    #trainers;
    #equipment;
    #atmosphere;
    #cleanliness;
    #classes;
  };

  type Review = {
    author : Text;
    rating : Nat8; // 1-5
    category : Category;
    opinion : Text;
    timestamp : Time.Time;
  };

  module Review {
    public func compare(r1 : Review, r2 : Review) : Order.Order {
      switch (Text.compare(r1.author, r2.author)) {
        case (#equal) { Int.compare(r1.timestamp, r2.timestamp) };
	      case (order) { order };
      };
    };
  };

  var nextId = 0;
  let reviews = Map.empty<Nat, Review>();

  public shared ({ caller }) func submitReview(
    author : Text,
    rating : Nat8,
    category : Category,
    opinion : Text,
  ) : async () {
    if (rating < 1 or rating > 5) { Runtime.trap("Rating must be between 1 and 5") };

    let review : Review = {
      author;
      rating;
      category;
      opinion;
      timestamp = Time.now();
    };

    reviews.add(nextId, review);
    nextId += 1;
  };

  public query ({ caller }) func getAllReviews() : async [Review] {
    reviews.values().toArray().sort();
  };
};
