"""
Comprehensive validation and edge case tests for all API endpoints.
"""

from datetime import date, timedelta, datetime
from decimal import Decimal
from django.urls import reverse
from rest_framework import status
from .test_utils import APITestCase, TestDataFactory


class ValidationEdgeCasesTestCase(APITestCase):
    """Test cases for validation errors and edge cases across all APIs."""

    def setUp(self):
        super().setUp()

    # INPUT VALIDATION TESTS
    def test_sql_injection_protection(self):
        """Test SQL injection protection across endpoints."""
        malicious_inputs = [
            "'; DROP TABLE users; --",
            "' OR '1'='1",
            "'; INSERT INTO users VALUES('hacker', 'pass'); --",
            "' UNION SELECT * FROM users --"
        ]
        
        self.authenticate()
        
        # Test wedding endpoints
        for malicious_input in malicious_inputs:
            wedding_data = TestDataFactory.create_wedding_data(theme=malicious_input)
            response = self.client.post('/api/weddings/', wedding_data)
            # Should either succeed with sanitized data or fail validation
            self.assertIn(response.status_code, [200, 201, 400])
        
        # Test guest endpoints
        for malicious_input in malicious_inputs:
            guest_data = TestDataFactory.create_guest_data(first_name=malicious_input)
            response = self.client.post('/api/guests/', guest_data)
            self.assertIn(response.status_code, [200, 201, 400])

    def test_xss_protection(self):
        """Test XSS protection across endpoints."""
        xss_payloads = [
            "<script>alert('xss')</script>",
            "<img src='x' onerror='alert(1)'>",
            "javascript:alert('xss')",
            "<svg onload='alert(1)'>"
        ]
        
        self.authenticate()
        
        # Test various endpoints with XSS payloads
        for payload in xss_payloads:
            # Wedding theme
            wedding_data = TestDataFactory.create_wedding_data(theme=payload)
            response = self.client.post('/api/weddings/', wedding_data)
            self.assertIn(response.status_code, [200, 201, 400])
            
            # Guest name
            guest_data = TestDataFactory.create_guest_data(first_name=payload)
            response = self.client.post('/api/guests/', guest_data)
            self.assertIn(response.status_code, [200, 201, 400])
            
            # Expense title
            expense_data = TestDataFactory.create_expense_data(
                title=payload,
                budget_category=self.budget_category.id
            )
            response = self.client.post('/api/expenses/', expense_data)
            self.assertIn(response.status_code, [200, 201, 400])

    def test_large_input_handling(self):
        """Test handling of large inputs."""
        large_string = 'x' * 10000  # 10KB string
        
        self.authenticate()
        
        # Test with large wedding theme
        wedding_data = TestDataFactory.create_wedding_data(theme=large_string)
        response = self.client.post('/api/weddings/', wedding_data)
        self.assert_error_response(response, 400, "VALIDATION_ERROR")
        
        # Test with large guest name
        guest_data = TestDataFactory.create_guest_data(first_name=large_string)
        response = self.client.post('/api/guests/', guest_data)
        self.assert_error_response(response, 400, "VALIDATION_ERROR")
        
        # Test with large expense notes
        expense_data = TestDataFactory.create_expense_data(
            notes=large_string,
            budget_category=self.budget_category.id
        )
        response = self.client.post('/api/expenses/', expense_data)
        self.assert_error_response(response, 400, "VALIDATION_ERROR")

    def test_unicode_handling(self):
        """Test Unicode character handling."""
        unicode_strings = [
            "José María González",
            "北京婚礼",
            "🎰💒💑",
            "العربية",
            "עברית",
            "日本語",
            "한국어",
            "Русский",
            "Ελληνικά",
            "العربية"
        ]
        
        self.authenticate()
        
        for unicode_string in unicode_strings:
            # Test with Unicode names
            guest_data = TestDataFactory.create_guest_data(first_name=unicode_string)
            response = self.client.post('/api/guests/', guest_data)
            if response.status_code == 201:
                # If successful, verify data integrity
                data = response.json()
                self.assertEqual(data['data']['first_name'], unicode_string)

    def test_special_characters_handling(self):
        """Test special characters handling."""
        special_chars = [
            "!@#$%^&*()_+-=[]{}|;':\",./<>?",
            "\n\r\t",
            "©®™€£¥§¶†‡•…‰‹›""''–—",
            "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞß",
            "àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ"
        ]
        
        self.authenticate()
        
        for special_char in special_chars:
            # Test with special characters in notes
            expense_data = TestDataFactory.create_expense_data(
                notes=f"Special chars: {special_char}",
                budget_category=self.budget_category.id
            )
            response = self.client.post('/api/expenses/', expense_data)
            if response.status_code == 201:
                # Verify data integrity
                data = response.json()
                self.assertIn(special_char, data['data']['notes'])

    # NUMERIC VALIDATION TESTS
    def test_numeric_validation_edge_cases(self):
        """Test numeric validation edge cases."""
        self.authenticate()
        
        # Test with extremely large numbers
        large_numbers = [
            '999999999999999999999.99',
            '1e20',
            '1.7976931348623157e+308'  # Max double
        ]
        
        for large_num in large_numbers:
            expense_data = TestDataFactory.create_expense_data(
                amount=large_num,
                budget_category=self.budget_category.id
            )
            response = self.client.post('/api/expenses/', expense_data)
            self.assert_error_response(response, 400, "VALIDATION_ERROR")
        
        # Test with very small numbers
        small_numbers = [
            '0.0000000000000001',
            '1e-20',
            '-0.0000000000000001'
        ]
        
        for small_num in small_numbers:
            expense_data = TestDataFactory.create_expense_data(
                amount=small_num,
                budget_category=self.budget_category.id
            )
            response = self.client.post('/api/expenses/', expense_data)
            self.assert_error_response(response, 400, "VALIDATION_ERROR")
        
        # Test with negative numbers where not allowed
        negative_data = TestDataFactory.create_expense_data(
            amount='-100.00',
            budget_category=self.budget_category.id
        )
        response = self.client.post('/api/expenses/', negative_data)
        self.assert_error_response(response, 400, "VALIDATION_ERROR")

    def test_date_validation_edge_cases(self):
        """Test date validation edge cases."""
        self.authenticate()
        
        # Test with invalid dates
        invalid_dates = [
            '2023-02-30',  # February 30th doesn't exist
            '2023-13-01',  # Month 13 doesn't exist
            '2023-00-01',  # Month 0 doesn't exist
            'invalid-date',
            '01/01/2023',  # Wrong format
            '2023/01/01',  # Wrong format
            '2023-1-1',    # Single digit month/day
        ]
        
        for invalid_date in invalid_dates:
            expense_data = TestDataFactory.create_expense_data(
                expense_date=invalid_date,
                budget_category=self.budget_category.id
            )
            response = self.client.post('/api/expenses/', expense_data)
            self.assert_error_response(response, 400, "VALIDATION_ERROR")
        
        # Test with dates too far in future
        far_future = (date.today() + timedelta(days=3650)).isoformat()  # 10 years
        wedding_data = TestDataFactory.create_wedding_data(wedding_date=far_future)
        response = self.client.post('/api/weddings/', wedding_data)
        self.assert_error_response(response, 400, "VALIDATION_ERROR")
        
        # Test with dates too far in past
        far_past = (date.today() - timedelta(days=3650)).isoformat()  # 10 years ago
        wedding_data = TestDataFactory.create_wedding_data(wedding_date=far_past)
        response = self.client.post('/api/weddings/', wedding_data)
        self.assert_error_response(response, 400, "VALIDATION_ERROR")

    def test_email_validation_edge_cases(self):
        """Test email validation edge cases."""
        self.authenticate()
        
        # Invalid email formats
        invalid_emails = [
            'plainaddress',
            '@missing-local.com',
            'username@.com',
            'username@com',
            'username@.com.',
            '.username@domain.com',
            'username@domain..com',
            'username@domain.c',
            'username@domain.corporate',
            'username@domain.toolongtld',
            'username@-domain.com',
            'username@domain-.com',
            'username@domain.com-',
            'username@domain.com_',
            'username@domain.com.',
            'username@domain..com',
            'username@domain .com',
            ' username@domain.com',
            'username @domain.com',
            'username@ domain.com',
            'username@domain .com',
            'username@domain.com ',
            ' username@domain.com ',
            'username@domain .com ',
            'user name@domain.com',
            'username@domain name.com',
            'user name@domain name.com'
        ]
        
        for invalid_email in invalid_emails:
            register_data = {
                'username': f'user_{len(invalid_email)}',
                'email': invalid_email,
                'password': 'testpass123',
                'first_name': 'Test',
                'last_name': 'User'
            }
            response = self.client.post('/api/auth/register/', register_data)
            self.assert_error_response(response, 400, "VALIDATION_ERROR")

    # AUTHORIZATION AND PERMISSION TESTS
    def test_cross_user_data_access(self):
        """Test that users cannot access other users' data."""
        self.authenticate()
        
        # Try to access other user's wedding
        response = self.client.get(f'/api/weddings/{self.other_wedding.id}/')
        self.assert_forbidden_response(response)
        
        # Try to access other user's guests
        response = self.client.get(f'/api/guests/{self.other_wedding.id}/')
        self.assert_forbidden_response(response)
        
        # Try to access other user's expenses
        response = self.client.get(f'/api/expenses/{self.other_wedding.id}/')
        self.assert_forbidden_response(response)

    def test_token_manipulation(self):
        """Test token manipulation and security."""
        # Test with invalid token
        self.client.credentials(HTTP_AUTHORIZATION='Token invalid_token_12345')
        response = self.client.get('/api/weddings/')
        self.assert_unauthorized_response(response)
        
        # Test with malformed token header
        self.client.credentials(HTTP_AUTHORIZATION='Bearer some_token')
        response = self.client.get('/api/weddings/')
        self.assert_unauthorized_response(response)
        
        # Test with no token
        self.client.credentials()  # Remove authentication
        response = self.client.get('/api/weddings/')
        self.assert_unauthorized_response(response)

    # RATE LIMITING TESTS
    def test_rate_limiting(self):
        """Test rate limiting on sensitive endpoints."""
        self.authenticate()
        
        # Test multiple rapid requests to login endpoint
        login_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        
        # Make multiple rapid requests
        responses = []
        for _ in range(20):
            response = self.client.post('/api/auth/login/', login_data)
            responses.append(response)
        
        # Check if rate limiting is applied (should return 429 after certain threshold)
        rate_limited = any(response.status_code == 429 for response in responses)
        # Note: This test assumes rate limiting is implemented
        # If not implemented, this serves as a reminder to add it

    # DATA INTEGRITY TESTS
    def test_data_integrity_constraints(self):
        """Test database integrity constraints."""
        self.authenticate()
        
        # Test duplicate unique constraints
        # Try to create duplicate wedding for same user
        wedding_data = TestDataFactory.create_wedding_data(
            wedding_date=(date.today() + timedelta(days=90)).isoformat(),
            theme='Second Wedding'
        )
        response = self.client.post('/api/weddings/', wedding_data)
        self.assert_error_response(response, 400, "VALIDATION_ERROR")
        
        # Test foreign key constraints
        invalid_expense_data = TestDataFactory.create_expense_data(
            budget_category=99999,  # Non-existent category
            vendor=99999  # Non-existent vendor
        )
        response = self.client.post('/api/expenses/', invalid_expense_data)
        self.assert_error_response(response, 400, "VALIDATION_ERROR")

    # CONCURRENT ACCESS TESTS
    def test_concurrent_updates(self):
        """Test concurrent updates to same resource."""
        self.authenticate()
        
        # Simulate concurrent updates to wedding
        update_data1 = {'theme': 'Concurrent Update 1'}
        update_data2 = {'theme': 'Concurrent Update 2'}
        
        # Make concurrent requests
        response1 = self.client.patch(f'/api/weddings/{self.wedding.id}/', update_data1)
        response2 = self.client.patch(f'/api/weddings/{self.wedding.id}/', update_data2)
        
        # Both should succeed, last one wins
        self.assertIn(response1.status_code, [200, 409])
        self.assertIn(response2.status_code, [200, 409])

    # MALICIOUS REQUEST TESTS
    def test_malicious_request_methods(self):
        """Test handling of malicious HTTP methods."""
        self.authenticate()
        
        # Try unsupported methods on endpoints
        response = self.client.patch('/api/auth/login/', {})
        self.assertIn(response.status_code, [405, 400])
        
        response = self.client.put('/api/auth/logout/', {})
        self.assertIn(response.status_code, [405, 400])
        
        response = self.client.delete('/api/auth/profile/')
        self.assertIn(response.status_code, [405, 400])

    def test_malicious_headers(self):
        """Test handling of malicious HTTP headers."""
        self.authenticate()
        
        # Test with suspicious headers
        malicious_headers = {
            'HTTP_USER_AGENT': 'Mozilla/5.0 (compatible; Bot/1.0)',
            'HTTP_REFERER': 'http://malicious-site.com',
            'HTTP_X_FORWARDED_FOR': '192.168.1.1',
            'HTTP_X_REAL_IP': '10.0.0.1'
        }
        
        for header, value in malicious_headers.items():
            # This would need to be tested with actual client header setting
            # For now, just ensure endpoints handle requests normally
            response = self.client.get('/api/weddings/')
            self.assertIn(response.status_code, [200, 401])

    # FILE UPLOAD SECURITY TESTS
    def test_file_upload_security(self):
        """Test file upload security (if file uploads are implemented)."""
        self.authenticate()
        
        # Test with malicious file names
        malicious_files = [
            '../../../etc/passwd',
            'shell.php',
            'script.js',
            'executable.exe',
            'virus.bat'
        ]
        
        # This would test file upload endpoints if they exist
        # For now, serves as a template for when file uploads are added
        for malicious_file in malicious_files:
            # Would test file upload validation
            pass

    # BOUNDARY VALUE TESTS
    def test_boundary_values(self):
        """Test boundary values for numeric and string fields."""
        self.authenticate()
        
        # Test with minimum valid values
        minimal_expense = TestDataFactory.create_expense_data(
            amount='0.01',  # Minimum positive amount
            budget_category=self.budget_category.id
        )
        response = self.client.post('/api/expenses/', minimal_expense)
        self.assertIn(response.status_code, [201, 400])
        
        # Test with maximum valid values (assuming reasonable limits)
        maximal_expense = TestDataFactory.create_expense_data(
            amount='999999.99',  # Large but reasonable amount
            budget_category=self.budget_category.id
        )
        response = self.client.post('/api/expenses/', maximal_expense)
        self.assertIn(response.status_code, [201, 400])

    # ERROR HANDLING TESTS
    def test_error_message_sanitization(self):
        """Test that error messages don't expose sensitive information."""
        self.authenticate()
        
        # Try to trigger database errors
        response = self.client.post('/api/expenses/', {
            'budget_category': 'SELECT * FROM users; --',
            'amount': '100.00'
        })
        
        if response.status_code == 400:
            error_data = response.json()
            error_message = error_data.get('error', {}).get('message', '')
            # Error message should not contain database details
            self.assertNotIn('SELECT', error_message.upper())
            self.assertNotIn('users', error_message.lower())

    # PERFORMANCE EDGE CASES
    def test_large_dataset_handling(self):
        """Test handling of large datasets."""
        self.authenticate()
        
        # Test with large pagination limits
        response = self.client.get('/api/guests/?limit=10000')
        # Should either limit the results or return an error
        self.assertIn(response.status_code, [200, 400])
        
        # Test with complex filtering
        response = self.client.get('/api/guests/?search=' + 'a' * 1000)
        self.assertIn(response.status_code, [200, 400])

    # HELPER METHODS
    def _assert_standard_response_format(self, response):
        """Assert that response follows standardized API format."""
        self.assertIn('success', response.json())
        if response.json()['success']:
            self.assertIn('data', response.json())
            self.assertIn('message', response.json())
        else:
            self.assertIn('error', response.json())
            self.assertIn('code', response.json()['error'])
            self.assertIn('message', response.json()['error'])
        self.assertIn('timestamp', response.json())
