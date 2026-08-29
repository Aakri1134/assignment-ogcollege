# Assignment for OGCollege by Aakrisht Srivastava

## Requirements okok
\

- To run the given code manually, you need node version >= 18

# Run

### To run backend

```
cd backend
npm install
npm run dev
```

### To run mailer

```
cd mailer
npm install
npm run dev
```

### To run using docker
```
docker compose up --build
```

## Other Requirements

To run the backend and mailer you must add a env file, an example of which is given as .env.example in the required directory.

A brief description on the requirements

- MONGODB_URI : mongodb connect link
- REDIS_URL : redis connect link
- EMAIL : email to send link
- PASSWORD : App password for the mail, generate this from settings in your gmail **App Password > generate**
- BACKEND_URL : link where backend is hosted

- Google OAuth Credentials : GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI : Internal Link to confirm connection with google


## Relevant Links
- [Link to Postman Collection](https://www.postman.com/altimetry-operator-83471468/workspace/aakrisht-public-workspace/collection/32739631-2daee71c-5597-49af-9e55-3e92ef40eaa3?action=share&creator=32739631&active-environment=32739631-9f8a3cff-b905-4c0a-85bd-f97b98bb67fb)
- [Demo Video](https://drive.google.com/file/d/1aRM_Q7Q6JNZltftdBYm5Vr6VubFA-aaa/view?usp=sharing)
