const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const axios = require("axios");
// import rooms data
const data = require("./data.json");

const app = express();
var corsOptions = {
  origin: "http://localhost:3001",
  optionsSuccessStatus: 200, // For legacy browser support
  methods: "GET",
  methods: "POST",
};

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function getDate(date) {
  if (!date) {
    const tuday = new Date();

    if (tuday.getDate() - tuday.getDay() < 0) {
      const currentYear = tuday.getFullYear();
      const currentMonth = tuday.getMonth();
      var day =
        getDaysInMonth(currentYear, currentMonth) +
        tuday.getDate() -
        tuday.getDay() +
        1;
      var month = tuday.getMonth() - 1;
    } else {
      var day = tuday.getDate() - tuday.getDay() + 1;
      var month = tuday.getMonth();
    }

    var year = tuday.getFullYear();
  } else {
    const tuday = new Date(date * 1000);
    var day = tuday.getDate();
    var month = tuday.getMonth();
    var year = tuday.getFullYear();
  }
  return [day, month, year];
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

axios.defaults.baseURL = "https://student.samdu.uz/rest/v1/data";

dotenv.config();
// Binolarni olish
app.get("/api/buildings", (req, res) => {
  // bino nomlari
  const buildings = new Set();
  data.forEach((item) => {
    buildings.add(item.building);
  });
  res.send(Array.from(buildings));
});
// xonalarni olish
app.post("/api/rooms", (req, res) => {
  const { building } = req.body.body;
  // binoga mos xonalarni olish
  const rooms = [];
  rooms.push(...data.filter((room) => room.building === building));
  res.send(rooms);
});

// get rooms schedule
app.post("/api/roomData", async (req, response) => {
  const { auditorium } = req.body.body;
  const roomData = [];
  axios
    .get(`schedule-list?_auditorium=${auditorium}&limit=200&page=1`, {
      headers: {
        Authorization: process.env.Authorization,
        accept: "application/json",
      },
    })
    .then((res1) => {
      roomData.push(...res1.data.data.items);
      if (
        res1.data.data.pagination.pageCount === 1 ||
        res1.data.data.pagination.pageCount === 0
      )
        response.send(filteringData(roomData));
      else
        for (let i = 2; i <= res1.data.data.pagination.pageCount; i++) {
          axios
            .get(
              `schedule-list?_auditorium=${auditorium}&limit=200&page=${i}`,
              {
                headers: {
                  Authorization: process.env.Authorization,
                  accept: "application/json",
                },
              }
            )
            .then((res) => {
              roomData.push(...res.data.data.items);
              if (roomData.length === res1.data.data.pagination.totalCount) {
                response.send(filteringData(roomData));
              }
            });
        }
    });
});

// haftalik ma'lumotlari filterlash funksiyasi
function filteringData(roomData) {
  if (roomData.length === 0)
    return {
      data: [],
      status: false,
    };
  const week_start = roomData.find((item) => {
    const [selecDay, selecMonth, selecYear] = getDate();
    const [lessonDay, lessonMonth, lessonYear] = getDate(item.weekStartTime);
    if (
      lessonDay === selecDay &&
      lessonMonth === selecMonth &&
      lessonYear === selecYear
    )
      return item;
  });

  if (week_start === undefined)
    return {
      data: [],
      status: true,
    };

  return {
    data: roomData.filter(
      (item) => item.weekStartTime === week_start.weekStartTime
    ),
    status: true,
  };
}

// Fakuletlar olish uchun so'rov -----------------------------
app.get("/api/facultets", (req, res) => {
  const lang = req.query.lang;

  axios
    .get(`department-list?l=${lang}&_structure_type=11&active=1&limit=100`, {
      headers: {
        Authorization: process.env.Authorization,
        accept: "application/json",
      },
    })
    .then((response) => {
      res.status(200).send({
        data: response.data.data.items.filter(
          (item) => item.structureType.code === "11" && item.id !== 2
        ),
        error: false,
      });
    })
    .catch((err) =>
      res.status(400).send({
        error: true,
        data: "Siz xato so'rov berdingiz",
      })
    );
});

// Guruhlarni olish uchun so'rov -----------------------------
app.get("/api/groups", (req, res) => {
  const faculty = req.query.faculty;
  const lang = req.query.lang;
  const year = req.query.year;
  axios
    .get(`/group-list?l=${lang}&_department=${faculty}&limit=200`, {
      headers: {
        Authorization: process.env.Authorization,
        accept: "application/json",
      },
    })
    .then((response) => {
      const regex = new RegExp(year);
      res.status(200).send({
        data: response.data.data.items.filter((item) => regex.test(item.name)),
        error: false,
      });
    })
    .catch((err) =>
      res.status(400).send({
        error: true,
        data: "Siz xato so'rov berdingiz",
      })
    );
});

// Jadvallarni olish uchun so'rov -----------------------------
app.get("/api/schedule", (req, res) => {
  const faculty = req.query.faculty;
  const group = req.query.group;
  const lang = req.query.lang;
  const semester = req.query.semester;

  console.log(
    `/schedule-list?l=${lang}&_faculty=${faculty}&_group=${group}&_semester=${semester}&limit=200`
  );
  axios
    .get(
      `/schedule-list?l=${lang}&_faculty=${faculty}&_group=${group}&_semester=${semester}&limit=200`,
      {
        headers: {
          Authorization: process.env.Authorization,
          accept: "application/json",
        },
      }
    )
    .then((response) => {
      if (response.data.data.items.length !== 0) {
        let week = response.data.data.items[0]["_week"];

        res.status(200).send({
          // data: response.data,
          data: response.data.data.items.filter(
            (item) => item["_week"] === week
          ),
          error: false,
        });
      } else {
        res.status(200).send({
          // data: response.data,
          data: [],
          error: false,
        });
      }
    })
    .catch((err) => {
      res.status(400).send({
        error: true,
        data: "Siz xato so'rov berdingiz",
      });
    });
});

// Grurhlarni olish uchun so'rov -----------------------------
app.get("/api/groups-hemis", (req, res) => {
  const faculty = req.query.facultyId;
  axios
    .get(`/group-list?_department=${faculty}&limit=200`, {
      headers: {
        Authorization: process.env.Authorization,
        accept: "application/json",
      },
    })
    .then((response) => {
      console.log(response.data);
      res.status(200).send({
        error: false,
        data: response.data.data.items,
      });
    })
    .catch((err) => {
      res.status(400).send({
        error: true,
        data: "Siz xato so'rov berdingiz",
      });
    });
});

// Studentlarni olish uchun so'rov -----------------------------
app.get("/api/students", (req, res) => {
  const groupId = req.query.groupId;
  axios
    .get(`/student-list?_group=${groupId}&limit=50`, {
      headers: {
        Authorization: process.env.Authorization,
        accept: "application/json",
      },
    })
    .then((response) => {
      console.log(response.data);
      res.status(200).send({
        error: false,
        data: response.data.data.items,
      });
    })
    .catch((err) => {
      res.status(400).send({
        error: true,
        data: "Siz xato so'rov berdingiz",
      });
    });
});

app.listen(process.env.PORT, () =>
  console.log(`app is running ${process.env.PORT}`)
);
