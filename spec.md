# GymVoice - Gym Community Reviews

## Current State
New project, no existing code.

## Requested Changes (Diff)

### Add
- Homepage with gym branding (hero section, tagline)
- Member reviews/opinions feed (public, read-only for visitors)
- Submit a review form: name, rating (1-5 stars), opinion text, optional gym department/category (e.g. trainers, equipment, atmosphere, cleanliness)
- Review cards showing name, rating stars, category tag, and opinion text with timestamp
- Filter reviews by category
- Overall rating summary (average stars, total count)

### Modify
N/A

### Remove
N/A

## Implementation Plan
- Backend: store reviews (id, author name, rating, category, text, timestamp), query all reviews, submit new review
- Frontend: hero section, overall stats bar, category filter tabs, reviews grid, submit review modal/form
