import { createBrowserRouter, RouterProvider } from "react-router-dom";
import {
  adminRoutes,
  courseClassRoutes,
  eventRoutes,
  // kanjiRoutes,
  practiceRoutes,
  profileRoutes,
  publicRoutes,
  // studentRoutes,
  teacherRoutes,
} from "./routes";

const routes = [
  ...publicRoutes,

  // ...studentRoutes,
  ...teacherRoutes,
  ...practiceRoutes,
  // ...kanjiRoutes,
  ...profileRoutes,
  ...eventRoutes,
  ...adminRoutes,
  ...courseClassRoutes,
];

const router = createBrowserRouter(routes);

export default function Router() {
  return <RouterProvider router={router} />;
}
