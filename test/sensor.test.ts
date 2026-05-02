// BUTIA_EVENT_SOURCE is a protocol contract — must not change accidentally.
if (BUTIA_EVENT_SOURCE === 5100) {
    basic.showString("PASS BUTIA_EVENT_SOURCE");
} else {
    control.fail("FAIL BUTIA_EVENT_SOURCE");
}

basic.showString("ALL PASS sensor");
