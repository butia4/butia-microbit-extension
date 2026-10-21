# Primeros pasos con Butia

## Primeros pasos @showdialog

En este tutorial vas a aprender a mover el robot Butia hacia adelante, hacia
atrás, detenerlo y girar. ¡Vamos!

## Avanzar

Agregá un bloque `||butiaV4:avanzar a velocidad||` en `||basic:on start||` y elegí una velocidad de 0 a 100 para que el robot avance.

```blocks
// @highlight
butiaV4.moveForward(60)
```

## Detener motores

A continuación, agregá el bloque `||basic:pause||` con 1 segundo y usá
`||butiaV4:detener motores||` para frenar el robot.

```blocks
butiaV4.moveForward(60)
basic.pause(1000)
// @highlight
butiaV4.motorStop()
```

## Retroceder

Agregá un bloque `||butiaV4:retroceder a velocidad||` y elegí la velocidad para que el robot vaya hacia atrás.

```blocks
butiaV4.moveForward(60)
basic.pause(1000)
butiaV4.motorStop()
basic.pause(500)
// @highlight
butiaV4.moveBackward(60)
```

## Detener motores otra vez

Frená de nuevo antes de girar.

```blocks
butiaV4.moveForward(60)
basic.pause(1000)
butiaV4.motorStop()
basic.pause(500)
butiaV4.moveBackward(60)
basic.pause(1000)
// @highlight
butiaV4.motorStop()
```

## Girar

Agregá un bloque `||butiaV4:girar hacia||` para que el robot gire hacia la
derecha durante medio segundo.

```blocks
butiaV4.moveForward(60)
basic.pause(1000)
butiaV4.motorStop()
basic.pause(500)
butiaV4.moveBackward(60)
basic.pause(1000)
butiaV4.motorStop()
basic.pause(500)
// @highlight
butiaV4.turn(ButiaTurnDirection.Right, 40, 0.5)
```

## ¡A programar! @showdialog

Ya sabés lo básico para mover a Butia: avanzar, retroceder, detenerse y
girar. Probá combinar estos bloques para armar un recorrido propio. ¡Éxitos!