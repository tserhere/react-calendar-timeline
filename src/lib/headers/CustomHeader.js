import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { TimelineHeadersConsumer } from './HeadersContext';
import { TimelineStateConsumer } from '../timeline/TimelineStateContext';
import { iterateTimes, calculateXPositionForTime } from '../utility/calendar';

function getHeaderIntervals({
  canvasTimeStart,
  canvasTimeEnd,
  unit,
  timeSteps,
  getLeftOffsetFromDate
}) {
  const intervals = [];
  iterateTimes(
    canvasTimeStart,
    canvasTimeEnd,
    unit,
    timeSteps,
    (startTime, endTime) => {
      const left = getLeftOffsetFromDate(startTime.valueOf());
      const right = getLeftOffsetFromDate(endTime.valueOf());
      const width = right - left;
      intervals.push({
        startTime,
        endTime,
        labelWidth: width,
        left
      });
    }
  );
  return intervals;
}

function CustomHeader({
  canvasTimeStart,
  canvasTimeEnd,
  canvasWidth,
  unit,
  timeSteps,
  showPeriod,
  getLeftOffsetFromDate,
  timelineWidth,
  visibleTimeStart,
  visibleTimeEnd, 
  headerData,
  children, // Add children prop here
}) {
  const [intervals, setIntervals] = useState([]);

  useEffect(() => {
    const newIntervals = getHeaderIntervals({
      canvasTimeStart,
      canvasTimeEnd,
      canvasWidth,
      unit,
      timeSteps,
      showPeriod,
      getLeftOffsetFromDate
    });

    setIntervals(newIntervals);
  }, [
    canvasTimeStart,
    canvasTimeEnd,
    canvasWidth,
    unit,
    timeSteps,
    showPeriod,
    getLeftOffsetFromDate
  ]);

  const getRootProps = (props = {}) => {
    const { style } = props;
    return {
      style: {
        position: 'relative',
        width: canvasWidth,
        height: props.height,
        ...style
      }
    };
  };

  const getIntervalProps = (props = {}) => {
    const { interval, style } = props;
    if (!interval) throw new Error('you should provide interval to the prop getter');
    const { startTime, labelWidth, left } = interval;
    return {
      style: getIntervalStyle({
        style,
        startTime,
        labelWidth,
        canvasTimeStart,
        unit,
        left
      }),
      key: `label-${startTime.valueOf()}`
    };
  };

  const getIntervalStyle = ({ left, labelWidth, style }) => {
    return {
      ...style,
      left,
      width: labelWidth,
      position: 'absolute'
    };
  };

  const getStateAndHelpers = () => {
    // Use the function arguments directly

    // TODO: only evaluate on changing params
    return {
      timelineContext: {
        timelineWidth,
        visibleTimeStart,
        visibleTimeEnd,
        canvasTimeStart,
        canvasTimeEnd
      },
      headerContext: {
        unit,
        intervals
      },
      getRootProps: getRootProps,
      getIntervalProps: getIntervalProps,
      showPeriod,
      data: headerData,
    };
  };

  const Renderer = children; // Use children directly
  return <Renderer {...getStateAndHelpers()} />;
}

const CustomHeaderWrapper = ({ children, unit, headerData, height }) => (
  <TimelineStateConsumer>
    {({ getTimelineState, showPeriod, getLeftOffsetFromDate }) => {
      const timelineState = getTimelineState();
      return (
        <TimelineHeadersConsumer>
          {({ timeSteps }) => (
            <CustomHeader
              children={children}
              timeSteps={timeSteps}
              showPeriod={showPeriod}
              unit={unit ? unit : timelineState.timelineUnit}
              {...timelineState}
              headerData={headerData}
              getLeftOffsetFromDate={getLeftOffsetFromDate}
              height={height}
            />
          )}
        </TimelineHeadersConsumer>
      );
    }}
  </TimelineStateConsumer>
);

CustomHeader.propTypes = {
  children: PropTypes.func.isRequired,
  unit: PropTypes.string.isRequired,
  timeSteps: PropTypes.object.isRequired,
  visibleTimeStart: PropTypes.number.isRequired,
  visibleTimeEnd: PropTypes.number.isRequired,
  canvasTimeStart: PropTypes.number.isRequired,
  canvasTimeEnd: PropTypes.number.isRequired,
  canvasWidth: PropTypes.number.isRequired,
  showPeriod: PropTypes.func.isRequired,
  headerData: PropTypes.object,
  getLeftOffsetFromDate: PropTypes.func.isRequired,
  height: PropTypes.number.isRequired,
};

CustomHeaderWrapper.propTypes = {
  children: PropTypes.func.isRequired,
  unit: PropTypes.string,
  headerData: PropTypes.object,
  height: PropTypes.number,
};

CustomHeaderWrapper.defaultProps = {
  height: 30,
};

export default CustomHeaderWrapper;
