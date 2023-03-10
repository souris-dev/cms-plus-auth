import express from 'express';
import userRouter from './routes/authRoute.js';
const app = express();

app.use(express.json());

const port: number = Number(process.env.PORT) || 8002;

app.use('/', userRouter);

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});