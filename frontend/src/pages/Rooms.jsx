import React, { useEffect, useState } from "react";
import { Dropdown, DropdownButton } from "react-bootstrap";
import { useSelector } from 'react-redux';
import axios from "axios";
function Rooms() {
    const [buildings, setBuilding] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [roomData, setRoomData] = useState({});
    const [scheduleData, setScheduleData] = useState([]);
    const [roomInfo, setRoomInfo] = useState({
        building: "",
        room: "",
    });
    const lang = useSelector(state => state.lang);

    const [loader, setLoader] = useState(false);

    function selectBuilding(name) {
        setRoomInfo({
            ...roomInfo,
            building: name,
        });

        axios
            .post("/rooms", {
                body: {
                    building: name,
                },
            })
            .then((res) => {
                setRooms(res.data);
            });
    }

    function selectRoom(id, name) {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        setRoomInfo({
            ...roomInfo,
            room: name,
        });
        setLoader(true);
        axios
            .post("/roomData", {
                body: {
                    auditorium: id,
                },
            })
            .then((res) => {
                if (res.data.status !== 0) {
                    let dayArr = [[], [], [], [], [], []];
                    const weekStartTime = res.data.data[0]?.weekStartTime;
                    res.data.data.forEach((item) => {
                        if (item.lesson_date === weekStartTime) dayArr[0].push(item);
                        if (item.lesson_date === weekStartTime + 86400)
                            dayArr[1].push(item);
                        if (item.lesson_date === weekStartTime + 86400 * 2)
                            dayArr[2].push(item);
                        if (item.lesson_date === weekStartTime + 86400 * 3)
                            dayArr[3].push(item);
                        if (item.lesson_date === weekStartTime + 86400 * 4)
                            dayArr[4].push(item);
                        if (item.lesson_date === weekStartTime + 86400 * 5)
                            dayArr[5].push(item);
                    });
                    setScheduleData(dayArr);
                }
                else setScheduleData([]);
                setLoader(false);
                setRoomData(res.data)
            });
    }

    useEffect(() => {
        axios.get("/buildings").then((res) => setBuilding(res.data));
    }, []);

    return (
        <div className="container-fluit main schedule-rooms p-3">
            <DropdownButton
                className="w-100 d-block"
                id="dropdown-item-button"
                title="Binoni tanlang"
            >
                {buildings.map((item, index) => (
                    <Dropdown.Item
                        key={index}
                        onClick={() => selectBuilding(item)}
                        as="button"
                    >
                        {item}
                    </Dropdown.Item>
                ))}
            </DropdownButton>
            <div className="row">
                <div className="col-4"> {rooms.length !== 0 ? (
                    <div className="px-lg-3 mt-3  ">
                        {rooms?.map((room, index) => (
                            <div
                                key={room.room_id}
                                onClick={() => selectRoom(room.room_id, room.name)}
                                className="row item mb-3 rooms"
                            >
                                <div className="col-md-1 col-2 header d-flex align-items-center justify-content-center">
                                    <p className="m-0 tartiblovchi">{index + 1}</p>
                                </div>
                                <div className="col">
                                    <div className="row ps-3 py-2 align-items-center room-name">
                                        <p className="m-0 ps-2 col-12">
                                            Xona nomi: <span>{room.name}</span>
                                        </p>
                                        <div className="col-12 d-flex ps-3 description">
                                            <p className="m-0 ps-2">
                                                Xona turi: <span>{room.room_type}</span>
                                            </p>
                                            <p className="m-0 ps-2">
                                                Xona sig'imi: <span>{room.capacity}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-2">
                        <h3>Iltimos yuqoridan binoni tanlang</h3>
                    </div>
                )}</div>

                <div className="container col-8 timetable">
                    <div className="mt-3 pb-4">{
                        roomData.hasOwnProperty("status") ? <>
                            {
                                !loader ?
                                    <>
                                        <div>
                                            <h5>
                                                Bino: {roomInfo.building} <br />
                                                Xona: {roomInfo.room}
                                            </h5>
                                        </div>
                                        {scheduleData?.length !== 0 ? (
                                            scheduleData?.map((item, index) => (
                                                <div key={index} className="row item mb-4">
                                                    <div className="col-12 col-md-1 header py-4 d-flex align-items-center justify-content-center">
                                                        <p className="m-0 writing-mode">{lang.week[index]}</p>
                                                    </div>
                                                    <div className="col-12 col-md-11">
                                                        <table className="table table-striped w-100">
                                                            <thead>
                                                                <tr>
                                                                    <th scope="col">#</th>
                                                                    <th scope="col">start_time</th>
                                                                    <th scope="col">end_time</th>
                                                                    <th scope="col">subject_name</th>
                                                                    <th scope="col">group</th>
                                                                    <th scope="col">trainingType</th>
                                                                    <th scope="col">employee</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {item.map((lesson) => (
                                                                    <tr key={lesson.id}>
                                                                        <th scope="row">{lesson?.lessonPair?.name}</th>
                                                                        <td>{lesson.lessonPair?.start_time}</td>
                                                                        <td>{lesson.lessonPair?.end_time}</td>
                                                                        <td>{lesson.subject?.name}</td>
                                                                        <td>{lesson.group?.name}</td>
                                                                        <td>{lesson.trainingType?.name}</td>
                                                                        <td>{lesson.employee?.name}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <h2 className="text-center">Sizda dars jadvali shakillanmagan</h2>
                                        )}
                                    </> : <h2 className="text-center">Jadval qayta ishlanmoqda kuting...</h2>
                            }
                        </> : ""
                    }

                    </div>
                </div>
            </div>
        </div>
    );
}

export default Rooms;
