import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Review {
    author: string;
    opinion: string;
    timestamp: Time;
    category: Category;
    rating: number;
}
export enum Category {
    equipment = "equipment",
    classes = "classes",
    atmosphere = "atmosphere",
    cleanliness = "cleanliness",
    trainers = "trainers"
}
export interface backendInterface {
    getAllReviews(): Promise<Array<Review>>;
    submitReview(author: string, rating: number, category: Category, opinion: string): Promise<void>;
}
