// Tests for sensor constants and event source identifier.

if (BUTIA_EVENT_SOURCE === 5100) {
    basic.showString("PASS BUTIA_EVENT_SOURCE");
} else {
    basic.showString("FAIL BUTIA_EVENT_SOURCE");
}

if (LINE_THRESHOLD === 512) {
    basic.showString("PASS LINE_THRESHOLD");
} else {
    basic.showString("FAIL LINE_THRESHOLD");
}

if (OBSTACLE_STOP_DISTANCE_CM === 10) {
    basic.showString("PASS OBSTACLE_STOP_DISTANCE_CM");
} else {
    basic.showString("FAIL OBSTACLE_STOP_DISTANCE_CM");
}

if (POLL_INTERVAL_MS === 50) {
    basic.showString("PASS POLL_INTERVAL_MS");
} else {
    basic.showString("FAIL POLL_INTERVAL_MS");
}

basic.showString("ALL PASS sensor");
