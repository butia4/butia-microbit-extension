# Seguidor de línea

## Seguidor de línea @showdialog

En este tutorial vas a programar a Butia para que siga una línea negra sobre
un fondo blanco, leyendo todo el tiempo dos sensores de grises: uno
conectado en **J1** (izquierdo) y otro en **J2** (derecho).

## Bucle infinito

Todo el control del robot va a vivir dentro de un bucle `||basic:forever||`,
que repite el código una y otra vez mientras el programa está corriendo.

```blocks
// @highlight
basic.forever(function () {

})
```

## Armar el if / else

Dentro del bucle, agregá un bloque `||logic:if||...||else||`. Por defecto
solo trae dos ramas (`if` y `else`); hacé click en el **ícono `+`** de
adentro del bloque para agregarle una rama `else if` en el medio, así queda
con tres ramas en total.

```blocks
basic.forever(function () {
    // @highlight
    if (true) {

    } else if (false) {

    } else {

    }
})
```

## Comparar el sensor izquierdo

Andá a la categoría **Logic > Comparison** y arrastrá el bloque de
comparación (el que tiene `<` en el medio) a la condición del `if`. Cambiá
el operador del medio por **`>`**. Después, andá a la categoría **Butia** y
metele adentro un bloque `||Butia:Sensor de grises en||` con el conector
**J1** del lado izquierdo, y escribí **50** del lado derecho.

```blocks
basic.forever(function () {
    // @highlight
    if (Butia.readGraySensor(Butia.J1) > 50) {

    } else if (false) {

    } else {

    }
})
```

## Girar hacia la izquierda

Si esa comparación se cumple, quiere decir que el robot se fue de más hacia
la derecha (la línea quedó del lado izquierdo). Agregá un bloque
`||Butia:Girar hacia||`, elegí **izquierda** y velocidad. Hacé click
en el **ícono `+`** del bloque para que aparezca el campo de duración, y
poné **1** segundo.

```blocks
basic.forever(function () {
    if (Butia.readGraySensor(Butia.J1) > 50) {
        // @highlight
        Butia.turn(TurnDirection.Left, 40, 1)
    } else if (false) {

    } else {

    }
})
```

## Comparar el sensor derecho

En la condición del `else if`, repetí el mismo paso: un bloque de
comparación con **`>`**, un `||Butia:Sensor de grises en||` con el conector
**J2** del lado izquierdo, y **50** del lado derecho.

```blocks
basic.forever(function () {
    if (Butia.readGraySensor(Butia.J1) > 50) {
        Butia.turn(TurnDirection.Left, 40, 1)
    // @highlight
    } else if (Butia.readGraySensor(Butia.J2) > 50) {

    } else {

    }
})
```

## Girar hacia la derecha

Si esta comparación se cumple, el robot se fue de más hacia la izquierda.
Agregá otro `||Butia:Girar hacia||`, elegí **derecha**, velocidad, y
usá de nuevo el **ícono `+`** para ponerle **1** segundo de duración.

```blocks
basic.forever(function () {
    if (Butia.readGraySensor(Butia.J1) > 50) {
        Butia.turn(TurnDirection.Left, 40, 1)
    } else if (Butia.readGraySensor(Butia.J2) > 50) {
        // @highlight
        Butia.turn(TurnDirection.Right, 40, 1)
    } else {

    }
})
```

## Seguir derecho

Por último, en la rama `else`, agregá `||Butia:Avanzar a velocidad||`. Si
ninguno de los dos sensores detecta la línea, el robot está bien centrado y
tiene que seguir avanzando derecho.

```blocks
basic.forever(function () {
    if (Butia.readGraySensor(Butia.J1) > 50) {
        Butia.turn(TurnDirection.Left, 40, 1)
    } else if (Butia.readGraySensor(Butia.J2) > 50) {
        Butia.turn(TurnDirection.Right, 40, 1)
    // @highlight
    } else {
        Butia.moveForward(50)
    }
})
```

## ¡Probalo! @showdialog

Con este bucle Butia ya puede seguir la línea, revisando los sensores todo
el tiempo. Si ves que el robot corrige para el lado que no es, probá
invertir los bloques `||Butia:Girar hacia||` — depende de cómo estén
montados físicamente tus sensores J1 y J2. ¡Buena suerte!