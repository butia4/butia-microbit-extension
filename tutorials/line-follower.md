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

## Leer el sensor izquierdo

Dentro del bucle, agregá un `||logic:if||` que compare
`||Butia:Sensor de grises en||` **J1** contra un umbral de **50**. Si el
valor es mayor, el robot está pisando la línea por la izquierda: hay que
girar a la derecha para corregir.

```blocks
basic.forever(function () {
    // @highlight
    if (Butia.readGraySensor(Butia.J1) > 50) {
        Butia.turn(TurnDirection.Right, 40)
    }
})
```

## Leer el sensor derecho

Agregá un `||logic:else if||` para el sensor **J2**: si detecta la línea,
el robot se fue de más hacia la derecha, así que corregí girando a la
izquierda.

```blocks
basic.forever(function () {
    if (Butia.readGraySensor(Butia.J1) > 50) {
        Butia.turn(TurnDirection.Right, 40)
    // @highlight
    } else if (Butia.readGraySensor(Butia.J2) > 50) {
        Butia.turn(TurnDirection.Left, 40)
    }
})
```

## Seguir derecho

Por último, agregá un `||logic:else||`: si ninguno de los dos sensores
detecta la línea, el robot está bien centrado y tiene que seguir avanzando
derecho.

```blocks
basic.forever(function () {
    if (Butia.readGraySensor(Butia.J1) > 50) {
        Butia.turn(TurnDirection.Right, 40)
    } else if (Butia.readGraySensor(Butia.J2) > 50) {
        Butia.turn(TurnDirection.Left, 40)
    // @highlight
    } else {
        Butia.moveForward(50)
    }
})
```

## ¡Probalo! @showdialog

Con este bucle Butia ya puede seguir la línea, revisando los sensores
todo el tiempo en vez de esperar un evento. Probá ajustar el umbral (50) o
las velocidades de giro y avance. ¡Buena suerte!