// scripts/fix-kotlin-patches.js
const fs = require('fs');
const path = require('path');

function applyPatch(relPath, findText, stubText) {
  const filePath = path.resolve(__dirname, '..', relPath);
  if (!fs.existsSync(filePath)) {
    console.warn(`[patch] File not found: ${relPath}`);
    return;
  }
  let src = fs.readFileSync(filePath, 'utf8');
  if (!src.includes(stubText)) {
    src = src.replace(findText, match => `${match}\n${stubText}`);
    fs.writeFileSync(filePath, src, 'utf8');
    console.log(`[patch] Patched ${relPath}`);
  }
}

// 1) Gesture Handler: stub missing overrides in RNGestureHandlerPackage.kt
applyPatch(
  'node_modules/react-native-gesture-handler/android/src/main/java/com/swmansion/gesturehandler/RNGestureHandlerPackage.kt',
  'class RNGestureHandlerPackage : ReactPackage',
  `    // STUB: satisfy non-optional Kotlin properties
    override fun getViewManagerNames(): List<String> = emptyList()
    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()`
);

// 2) React Native Screens: stub missing overrides in ScreenStackFragment.kt
applyPatch(
  'node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/ScreenStackFragment.kt',
  'class ScreenStackFragment',
  `    // STUB: implement newly required methods
    override fun getPointerEvents(): PointerEvents? = null
    override fun onChildStartedNativeGesture(child: View, event: MotionEvent): Boolean = false
    override fun handleException(child: View, e: Exception) { /* no-op */ }`
);
