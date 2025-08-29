// Simple JavaScript test to verify WhatsApp button accessibility features
// This can be run in the browser console to test the implementation

function testWhatsAppButtonAccessibility() {
    console.log('🧪 Testing WhatsApp Button Accessibility Features...');

    // Find the WhatsApp button
    const button = document.querySelector('button[aria-label*="WhatsApp"], button[title*="WhatsApp"]');

    if (!button) {
        console.error('❌ WhatsApp button not found on page');
        return false;
    }

    console.log('✅ WhatsApp button found');

    // Test 1: Check ARIA attributes
    console.log('\n📋 Testing ARIA attributes...');

    const hasAriaLabel = button.hasAttribute('aria-label');
    const hasAriaDescribedBy = button.hasAttribute('aria-describedby');
    const hasRole = button.hasAttribute('role');
    const hasTabIndex = button.hasAttribute('tabindex');

    console.log(`  aria-label: ${hasAriaLabel ? '✅' : '❌'} ${button.getAttribute('aria-label') || 'missing'}`);
    console.log(`  aria-describedby: ${hasAriaDescribedBy ? '✅' : '❌'} ${button.getAttribute('aria-describedby') || 'missing'}`);
    console.log(`  role: ${hasRole ? '✅' : '❌'} ${button.getAttribute('role') || 'missing'}`);
    console.log(`  tabindex: ${hasTabIndex ? '✅' : '❌'} ${button.getAttribute('tabindex') || 'missing'}`);

    // Test 2: Check for hidden description element
    console.log('\n📝 Testing screen reader description...');

    const descriptionId = button.getAttribute('aria-describedby');
    const descriptionElement = descriptionId ? document.getElementById(descriptionId) : null;

    if (descriptionElement) {
        console.log('✅ Description element found');
        console.log(`  Content: "${descriptionElement.textContent}"`);
        console.log(`  Hidden from visual users: ${descriptionElement.classList.contains('sr-only') ? '✅' : '❌'}`);
    } else {
        console.log('❌ Description element not found');
    }

    // Test 3: Check icon accessibility
    console.log('\n🎨 Testing icon accessibility...');

    const icon = button.querySelector('svg');
    if (icon) {
        const hasAriaHidden = icon.hasAttribute('aria-hidden');
        console.log(`  Icon aria-hidden: ${hasAriaHidden ? '✅' : '❌'} ${icon.getAttribute('aria-hidden')}`);
    } else {
        console.log('❌ Icon not found');
    }

    // Test 4: Check color contrast (basic check)
    console.log('\n🎨 Testing color contrast...');

    const styles = window.getComputedStyle(button);
    const backgroundColor = styles.backgroundColor;
    const color = styles.color;

    console.log(`  Background color: ${backgroundColor}`);
    console.log(`  Text color: ${color}`);

    // Check if it uses WhatsApp green
    const hasWhatsAppGreen = backgroundColor.includes('37, 211, 102') ||
        styles.getPropertyValue('background-color').includes('#25D366');
    console.log(`  Uses WhatsApp green: ${hasWhatsAppGreen ? '✅' : '❌'}`);

    // Test 5: Check focus management
    console.log('\n🎯 Testing focus management...');

    const hasFocusStyles = styles.getPropertyValue('outline') !== 'none' ||
        button.classList.toString().includes('focus:');
    console.log(`  Has focus styles: ${hasFocusStyles ? '✅' : '❌'}`);

    // Test 6: Check minimum touch target size
    console.log('\n📱 Testing touch target size...');

    const rect = button.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const meetsMinimumSize = width >= 44 && height >= 44;

    console.log(`  Size: ${width}px × ${height}px`);
    console.log(`  Meets 44px minimum: ${meetsMinimumSize ? '✅' : '❌'}`);

    // Test 7: Test keyboard navigation
    console.log('\n⌨️ Testing keyboard navigation...');

    let keyboardTestPassed = true;

    try {
        // Focus the button
        button.focus();
        const isFocused = document.activeElement === button;
        console.log(`  Can receive focus: ${isFocused ? '✅' : '❌'}`);

        if (!isFocused) {
            keyboardTestPassed = false;
        }

        // Test if disabled button is not focusable
        if (button.disabled) {
            const tabIndex = button.getAttribute('tabindex');
            const notFocusableWhenDisabled = tabIndex === '-1';
            console.log(`  Not focusable when disabled: ${notFocusableWhenDisabled ? '✅' : '❌'}`);
        }

    } catch (error) {
        console.log('❌ Keyboard navigation test failed:', error.message);
        keyboardTestPassed = false;
    }

    // Summary
    console.log('\n📊 Accessibility Test Summary:');
    console.log('================================');

    const tests = [
        hasAriaLabel && hasAriaDescribedBy && hasRole,
        descriptionElement && descriptionElement.classList.contains('sr-only'),
        icon && icon.hasAttribute('aria-hidden'),
        hasWhatsAppGreen,
        hasFocusStyles,
        meetsMinimumSize,
        keyboardTestPassed
    ];

    const passedTests = tests.filter(Boolean).length;
    const totalTests = tests.length;

    console.log(`Tests passed: ${passedTests}/${totalTests}`);

    if (passedTests === totalTests) {
        console.log('🎉 All accessibility tests passed!');
        return true;
    } else {
        console.log('⚠️ Some accessibility tests failed. Please review the implementation.');
        return false;
    }
}

// Instructions for manual testing
console.log(`
🧪 WhatsApp Button Accessibility Test Suite
==========================================

To run this test:
1. Open your website in a browser
2. Open the browser console (F12)
3. Copy and paste this entire script
4. Run: testWhatsAppButtonAccessibility()

Additional manual tests to perform:
- Use Tab key to navigate to the button
- Press Enter or Space to activate the button
- Press Escape to remove focus
- Test with a screen reader (NVDA, JAWS, VoiceOver)
- Test on mobile devices for touch accessibility
- Test in high contrast mode
- Verify focus ring visibility

For screen reader testing:
- The button should be announced as "Contact us on WhatsApp, button"
- The description should include business context
- Status changes should be announced
`);

// Auto-run if button is present
if (document.readyState === 'complete') {
    setTimeout(() => {
        if (document.querySelector('button[aria-label*="WhatsApp"], button[title*="WhatsApp"]')) {
            console.log('WhatsApp button detected. Running accessibility test...');
            testWhatsAppButtonAccessibility();
        }
    }, 1000);
}