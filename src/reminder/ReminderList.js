/* eslint-disable no-unused-vars */
// import PropTypes from "prop-types";
import "../App.css";
import React, { useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { closestCorners, DndContext } from "@dnd-kit/core";
import { connect } from "react-redux";
import { getReminders, postReminder, putReminder } from "../actions/axios";
import {
  SET_TEXT,
  SET_CHECKED,
  SET_SHOW_FULL,
  SET_REMINDER_TOGGLE,
  SET_WRAP_POSITION,
  SET_CONT_POSITION,
  SET_FOOT_POSITION,
  DASHBOARD,
} from "./reducer";
import { store } from "..";
import { Link } from "react-router-dom";
import Reminder from "./Reminder";
// REMINDERS

function ReminderList(props) {
  const dispatch = store.dispatch;
  const {
    loading,
    dashboard,
    text,
    checked,
    reminderToggle,
    reminders,
    showDash,
    showFull,
    wrapperSize,
    contSize,
    footSize,
  } = props.state.reminder;

  //////// LOCAL STATE ////////
  const [droppable, setdroppable] = useState([]);
  const [newOrder, setnewOrder] = useState([]);
  const [dropTrigger, setdropTrigger] = useState(false);
  const [data, setdata] = useState([{ text: "" }]);

  //////// USEREFS ////////
  const wrapperDivRef = useRef(null);
  const containerDivRef = useRef(null);
  const FooterivRef = useRef(null);
  const inputRef = useRef(null);
  const getRef = useRef(false);

  // ********** GET THESE INTO ACTIONS FOLDER ***********
  function findWrapperPosition() {
    if (wrapperDivRef.current) {
      const xPos = wrapperDivRef.current.offsetLeft + window.scrollX;
      const yPos = wrapperDivRef.current.offsetTop + window.scrollY;
      console.log("WRAP", { wdidth: xPos, hieght: yPos });
      console.log("appHeight", appHeight);
      setPadSize(appHeight);
      dispatch({
        type: SET_WRAP_POSITION,
        screenSize: yPos,
      });
      return yPos;
    }
  }
  function findContainerPosition() {
    if (containerDivRef.current) {
      const xPos = containerDivRef.current.offsetLeft + window.scrollX;
      const yPos = containerDivRef.current.offsetTop + window.scrollY;
      console.log("CONTAIN", { wdidth: xPos, hieght: yPos });

      dispatch({
        type: SET_CONT_POSITION,
        screenSize: yPos,
      });
      return yPos;
    }
  }
  function findFooterPosition() {
    if (FooterivRef.current) {
      const xPos = FooterivRef.current.offsetLeft + window.scrollX;
      const yPos = FooterivRef.current.offsetTop + window.scrollY;
      console.log("FOOTER", { wdidth: xPos, hieght: yPos });
      dispatch({
        type: SET_FOOT_POSITION,
        screenSize: yPos,
      });
      return yPos;
    }
  }

  const appHeight = Math.round(footSize - contSize);
  const [padSize, setPadSize] = useState(appHeight);

  //////// ONLOAD ////////
  useEffect(() => {
    console.log("INITIAL");
    getReminders(dispatch);
    getRef.current = true;
    // dispatch({ type: SET_NAV, nav: window.location.pathname });
    findContainerPosition();
    findWrapperPosition();
    findFooterPosition();
    console.log("PROPS:", props);
    window.addEventListener("scroll", findContainerPosition);
    window.addEventListener("scroll", findWrapperPosition);
    window.addEventListener("scroll", findFooterPosition);
    return () => {
      window.removeEventListener("scroll", findContainerPosition);
      window.removeEventListener("scroll", findWrapperPosition);
      window.removeEventListener("scroll", findContainerPosition);
    };
  }, []);

  useEffect(() => {
    console.log("REMINDERSSSSSS");
    getRef.current = true;
    const dropArr = [];
    reminders.map((rem) => dropArr.push(rem.order));
    setdroppable(dropArr);
  }, [reminders]);

  useEffect(() => {
    console.log("DROPTRIGGER");
    const _newOrder = [];
    droppable.map((drop, index) =>
      reminders
        .filter((reminder) => reminder.order === drop)
        .map((reminder) =>
          _newOrder.push({ id: reminder.id, order: index + 1 })
        )
    );
    dropTrigger && setnewOrder(_newOrder);
  }, [dropTrigger]);

  useEffect(() => {
    if (dropTrigger) {
      console.log("NEWORDER");
      setdropTrigger(false);
      putReminder(dispatch, newOrder);
    }
  }, [newOrder]);

  function newOrderFunc() {
    const orderArr = [];
    reminders.map((rem) => {
      console.log(reminders.indexOf(rem));
      let data = { id: rem.id, order: reminders.indexOf(rem) + 1 };
      orderArr.push(data);
      return data;
    });
    setdroppable(orderArr);
  }

  //////// DnD KIT DRAGGABLE FUNCTION ////////
  function handleDragEnd(event) {
    console.log("Drag end called");
    const { active, over } = event;
    console.log("ACTIVE: " + active.id);
    console.log("OVER: " + over.id);

    if (active.id !== over.id) {
      setdroppable((items) => {
        const activeIndex = items.indexOf(active.id);
        const overIndex = items.indexOf(over.id);
        console.log("activeINDEX: " + items.indexOf(active.id));
        console.log("overINDEX: " + items.indexOf(over.id));
        console.log(arrayMove(items, activeIndex, overIndex));
        return arrayMove(items, activeIndex, overIndex);
      });
      setdropTrigger(true);
      // setTimeout(() => {
      // }, 1000);
    }
  }

  return (
    <div ref={wrapperDivRef} className="reminderWrapper">
      {loading && <div className="loadBar">I LOVE CHRISTINE</div>}

      <div className="subNavHeader">
        <button
          className="addnewButton"
          onClick={() => {
            dispatch({ type: SET_SHOW_FULL, showFull: showFull });
          }}
        >
          {showFull ? "shrink" : "grow"}
        </button>
        {dashboard !== null && (
          <button
            style={{ margin: "auto", maxHeight: "40px" }}
            onClick={() => {
              dispatch({ type: DASHBOARD, dashboard: null });
            }}
          >
            clearDash
          </button>
        )}
        {props.dashboard ? (
          <button className="addnewButton">
            <Link
              style={{ textDecoration: "none", color: "black" }}
              to="/reminders"
            >
              {showDash ? "dash" : "board"}
            </Link>
          </button>
        ) : (
          <button className="addnewButton" onClick={() => newOrderFunc()}>
            order
          </button>
          // <Link
          //   style={{ textDecoration: "none", color: "black" }}
          //   to="/reminders/dashboard"
          // >
          //   {showDash ? "dash" : "board"}
          // </Link>
        )}
      </div>
      <br />
      <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div ref={containerDivRef} className="remindersContainer">
          <SortableContext items={droppable}>
            {droppable.length > 0 &&
              droppable.map((drop, index) =>
                reminders
                  .filter((reminder) => reminder.order === drop)
                  .map((reminder) => (
                    <Reminder
                      key={reminder.id}
                      id={drop}
                      reminder={reminder}
                      state={props.state.reminder}
                    />
                  ))
              )}
          </SortableContext>
          {/* NEW REMINDER */}
          {reminderToggle ? (
            <div>
              <input
                className="phantomCheckbox"
                type="checkbox"
                checked={checked}
                onChange={() =>
                  dispatch({ type: SET_CHECKED, checked: checked })
                }
              />
              <TextareaAutosize
                ref={inputRef}
                className="col-9 borderBottom mx-3 py-1 pl-2"
                placeholder="Add new Reminder here..."
                type="text"
                defaultValue={""}
                value={text}
                onChange={(e) => {
                  setdata([{ text: e.target.value }]);
                  dispatch({ type: SET_TEXT, text: e.target.value });
                }}
                onBlur={() => {
                  console.log("i love you chritine");
                  text !== "" && postReminder(dispatch, data);
                  dispatch({
                    type: SET_REMINDER_TOGGLE,
                    reminderToggle: reminderToggle,
                  });
                }}
                autoFocus
              />
              <button
                className="submitButton"
                onClick={() => {
                  console.log("its a me MARIO");
                  text === "" && postReminder(dispatch, data);
                }}
              >
                +
              </button>
              <div
                style={{ height: "100vh" }}
                onClick={() =>
                  dispatch({
                    type: SET_REMINDER_TOGGLE,
                    reminderToggle: false,
                  })
                }
              ></div>
            </div>
          ) : (
            <div
              onClick={() =>
                dispatch({
                  type: SET_REMINDER_TOGGLE,
                  reminderToggle: reminderToggle,
                })
              }
              style={{ height: "100vh" }}
            ></div>
          )}
        </div>
      </DndContext>
      <br />
      <br />
      <br />
      <footer ref={FooterivRef} className="footer">
        thot.org
      </footer>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    state,
  };
}

export default connect(mapStateToProps)(ReminderList);
// vercel
// Reminders.propTypes = {
//   reminder: PropTypes.object,
// };